import { Modal } from "antd";

export function confirmDelete({
  title = "Are you sure you want to delete?",
  content = "",
  okText = "Yes",
  cancelText = "Cancel",
  okType = "primary",
}) {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      content,
      okText,
      cancelText,
      okType,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}
export function confirmUpdate({
  title = "Are you sure you want to Update this?",
  content = "",
  okText = "Yes",
  cancelText = "Cancel",
  okType = "primary",
}) {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      content,
      okText,
      cancelText,
      okType,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}
export function confirmToggle({
  title = "Are you sure you want to Toggle this?",
  content = "",
  okText = "Yes",
  cancelText = "Cancel",
  okType = "primary",
}) {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      content,
      okText,
      cancelText,
      okType,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

export function confirmRestore({
  title = "Restore this item?",
  content = "This will restore the deleted item.",
  okText = "Restore",
  cancelText = "Cancel",
  okType = "primary",
}) {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      content,
      okText,
      cancelText,
      okType,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

export function confirmDeleteEntity({
  entity = "item",
  childWarning = "associated records",
}) {
  return new Promise((resolve) => {
    Modal.confirm({
      title: `Delete ${entity}`,
      content: `Deleting this ${entity.toLowerCase()} will affect ${childWarning}. This action cannot be undone. Are you sure?`,
      okText: "Delete",
      cancelText: "Cancel",
      okType: "danger",
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}
