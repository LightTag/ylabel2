import React, { FunctionComponent } from "react";
import { ButtonProps, DialogTitle } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import FileUploadButton from "./simpleDataUpload";
import Button from "@material-ui/core/Button";
const AddDataDialog: FunctionComponent<{
  open: boolean;
  onClose: () => void;
}> = (props) => {
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>Add Data</DialogTitle>
      <DialogContent>
        <FileUploadButton />
      </DialogContent>
    </Dialog>
  );
};

export const AddDataDialogWithButton: FunctionComponent<{
  buttonProps?: ButtonProps;
  label: string;
}> = (props) => {
  const [open, setOpen] = React.useState<boolean>(false);
  return (
    <>
      <Button {...props.buttonProps} onClick={() => setOpen(true)}>
        {props.label}
      </Button>
      <AddDataDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
export default AddDataDialog;
