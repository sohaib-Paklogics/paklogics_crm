import Attachment from "../models/attachment.model.js";
import ApiError from "../utils/ApiError.js";
import { getPagination, paginate } from "../utils/pagination.js";
import cloudinary, { streamUpload } from "../utils/cloudinary.js";


export async function uploadAttachment({ leadId, file, uploadedBy }) {
  if (!file) throw new ApiError(400, "No file provided");
  const uploaded = await streamUpload(file.buffer, `crm/leads/${leadId}`);

  const doc = await Attachment.create({
    leadId,
    fileName: file.originalname,
    fileUrl: uploaded.secure_url,
    fileSize: file.size,
    mimeType: file.mimetype,
    uploadedBy,
    cloudinaryPublicId: uploaded.public_id, // add this field to model if you want clean deletes
  });

  return doc;
}

export async function listAttachments(leadId, query) {
  const { skip, limit, page } = getPagination(query.page, query.limit);
  const filter = { leadId };
  const [total, rows] = await Promise.all([
    Attachment.countDocuments(filter),
    Attachment.find(filter)
      .populate("uploadedBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);
  return paginate(rows, page, limit, total);
}

export async function deleteAttachment(attachmentId) {
  const doc = await Attachment.findById(attachmentId);
  if (!doc) throw new ApiError(404, "Attachment not found");
  // Optional: destroy from Cloudinary if you stored public id
  if (doc.cloudinaryPublicId) {
    await cloudinary.uploader.destroy(doc.cloudinaryPublicId);
  }
  await doc.deleteOne();
  return { id: attachmentId };
}
