import NoteAppModel from "../model/noteapp.js";

export const createNoteApp = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;
    if (!title || !description) {
      return res.json({
        status: false,
        message: "Some field are missing",
      });
    }
    console.log("userId: ", userId);
    const data = { title, description, userId , modifiedDate: null };
    const isSaved = await NoteAppModel.create(data);
    if (isSaved) {
      return res.json({
        status: true,
        message: "created successfully",
      });
    }
  } catch (err) {
    return res.json({
      status: false,
      message: err.message,
    });
  }
};

export const getNoteApp = async (req, res) => {
  console.log('req: ', req);
  try {
    const id = req.user.id;
    console.log('id: ', id);

    const noteAppData = await NoteAppModel.find({ userId: id });
    console.log('noteAppData: ', noteAppData);

    if (noteAppData.length > 0) {
      return res.json({
        status: true,
        message: "Data available",
        data: noteAppData,
      });
    } else {
      return res.json({
        status: false,
        message: "No data available",
      });
    }
  } catch (err) {
    return res.json({
      status: false,
      message: err.message,
    });
  }
};

export const updateNoteApp = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const checkContain = await NoteAppModel.findById(id);

    if (checkContain) {
      const isUpdate = await NoteAppModel.findByIdAndUpdate(
        id,
        { title, description, modifiedDate: new Date() },
        { new: true }
      );

      return res.status(201).json({
        status: true,
        message: "Updated successfully",
        data: isUpdate,
      });
    } else {
      return res.status(400).json({
        status: false,
        message: "Note not found",
      });
    }
  } catch (err) {
    return res.status(400).json({
      status: false,
      message: err.message,
    });
  }
};

export const deleteNoteApp = async (req, res) => {
    try {
      const { id } = req.params;
  
      const checkContain = await NoteAppModel.findById(id);
  
      if (checkContain) {
        await NoteAppModel.findByIdAndDelete(id);
  
        return res.json({
          status: true,
          message: "Successfully deleted",
        });
      } else {
        return res.json({
          status: false,
          message: "Note not found",
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  };
  