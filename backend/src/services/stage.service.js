// services/stage.service.js
import Stage from "../models/stage.model.js";
import Lead from "../models/lead.model.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

export async function listStages({ includeInactive = false } = {}) {
  const q = includeInactive ? {} : { active: true };
  return Stage.find(q).sort({ order: 1 });
}

export async function getStage(id) {
  const stage = await Stage.findById(id);
  if (!stage) throw new ApiError(404, "Stage not found");
  return stage;
}

export async function createStage({ name, key, color, isDefault = false, createdBy }) {
  // compute next order
  const last = await Stage.findOne().sort({ order: -1 });
  const order = last ? last.order + 1 : 1;

  if (isDefault) {
    await Stage.updateMany({ isDefault: true }, { $set: { isDefault: false } });
  }

  const stage = await Stage.create({ name, key, color, order, isDefault, createdBy });
  return stage;
}

// optionally use integers with gaps (e.g., step = 1024) instead of midpoints
const STEP = 1024;

async function computeAdjacentOrder(pivotId, where) {
  const pivot = await Stage.findById(pivotId).lean();
  if (!pivot) throw new Error("Pivot stage not found");

  if (where === "before") {
    const prev = await Stage.findOne({ order: { $lt: pivot.order } })
      .sort({ order: -1 })
      .lean();

    // midpoint strategy
    if (prev) return (prev.order + pivot.order) / 2;

    // or gaps strategy
    // if (prev) return prev.order + Math.floor((pivot.order - prev.order)/2);
    // else return pivot.order - STEP;

    return pivot.order - 1; // simple fallback
  } else {
    const next = await Stage.findOne({ order: { $gt: pivot.order } })
      .sort({ order: 1 })
      .lean();

    if (next) return (pivot.order + next.order) / 2;

    // or gaps strategy: return pivot.order + STEP;
    return pivot.order + 1; // simple fallback
  }
}

export async function createStageAdjacent({ pivotId, where, name, color, createdBy }) {
  // Optional: session for atomicity
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const order = await computeAdjacentOrder(pivotId, where);

    const key = name.toLowerCase().replace(/\s+/g, "_").slice(0, 40);

    const stage = await Stage.create(
      [
        {
          name,
          key,
          color,
          order,
          isDefault: false,
          createdBy,
        },
      ],
      { session },
    );

    // Optional: detect too-small gaps & reindex
    // if (await needsReindex()) await reindexOrders({ session });

    await session.commitTransaction();
    return stage[0];
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}

export async function reindexOrders({ session } = {}) {
  const stages = await Stage.find({})
    .sort({ order: 1 })
    .session(session || null);
  for (let i = 0; i < stages.length; i++) {
    stages[i].order = (i + 1) * STEP; // give big gaps for future inserts
    await stages[i].save({ session });
  }
}

export async function updateStage(id, data) {
  if (data.isDefault === true) {
    await Stage.updateMany({ isDefault: true }, { $set: { isDefault: false } });
  }
  const updated = await Stage.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw new ApiError(404, "Stage not found");
  return updated;
}

// Safest delete: require a target stage to move existing leads
export async function deleteStage(id, { targetStageId } = {}) {
  const stage = await Stage.findById(id);
  if (!stage) throw new ApiError(404, "Stage not found");

  const leadCount = await Lead.countDocuments({ stage: id });
  if (leadCount > 0) {
    if (!targetStageId) throw new ApiError(400, "Stage has leads; provide targetStageId to reassign");
    const target = await Stage.findById(targetStageId);
    if (!target) throw new ApiError(404, "Target stage not found");
    await Lead.updateMany({ stage: id }, { $set: { stage: target._id, status: target.key } });
  }

  await Stage.findByIdAndDelete(id);
  return { deleted: true };
}

export async function reorderStages(orderIds = []) {
  // orderIds: [stageId in desired order]
  const bulk = orderIds.map((id, idx) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: idx + 1 } },
    },
  }));
  if (bulk.length) await Stage.bulkWrite(bulk);
  return listStages();
}
