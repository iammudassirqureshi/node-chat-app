import Message from "../schemas/Message.mjs";
import User from "../schemas/User.mjs";

export const conversation = async (req, res, next) => {
  try {
    const { id: me, role } = req.user;
    const otherUserId = req.params.id;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    if (me === otherUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself",
      });
    }

    const otherUser = await User.findById(otherUserId).lean();
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (otherUser.role === role) {
      return res.status(403).json({
        success: false,
        message: "Chat not allowed between same roles",
      });
    }

    const conversation = await Message.find({
      $or: [
        { senderId: me, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: me },
      ],
    })
      .populate("senderId", "name role")
      .populate("receiverId", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Conversation retrieved successfully",
      conversation: conversation,
    });
  } catch (error) {
    console.error("Error in conversation controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
