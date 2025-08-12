
import cron from 'node-cron';
import Message from '../models/message.model.js';

// Clean up messages older than 30 days
const cleanupOldMessages = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await Message.deleteMany({
      timestamp: { $lt: thirtyDaysAgo }
    });
    
    console.log(`Cleaned up ${result.deletedCount} old messages`);
  } catch (error) {
    console.error('Error cleaning up messages:', error);
  }
};

// Schedule cleanup to run daily at 2 AM
cron.schedule('0 2 * * *', cleanupOldMessages);

export default cleanupOldMessages;
