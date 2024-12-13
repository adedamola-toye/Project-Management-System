import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../../store/modal/modalSlice";
import { deleteProject } from "../../store/project/projectSlice";
import "../Page Styles/Modals.css"

const ConfirmationModal = () => {
  const dispatch = useDispatch();
  const { isOpen, modalType } = useSelector((state) => state.modal);
  const { currentProject } = useSelector((state) => state.project);

  if (!isOpen || modalType !== "deleteProject") return null; // Render nothing if the modal is not open or it's not the delete modal

  const handleConfirm = () => {
    dispatch(deleteProject(currentProject.id));
    dispatch(closeModal());
  };

  const handleCancel = () => {
    dispatch(closeModal());
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Are you sure?</h2>
        <p>This action cannot be undone. Do you want to delete this project?</p>
        <button onClick={handleConfirm}>Yes</button>
        <button onClick={handleCancel}>No</button>
      </div>
    </div>
  );
};

export default ConfirmationModal;
