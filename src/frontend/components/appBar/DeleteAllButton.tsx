import React, { FunctionComponent } from "react";
import { Dialog } from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import DialogContent from "@material-ui/core/DialogContent";
import DownloadButton from "./DownloadButton";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { mainThreadDB } from "../../../backend/database/database";
import { useExampleCount } from "../../../backend/database/useDatabase";

const useStyles = makeStyles((theme) => ({
  header: {
    background: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
  button: {
    background: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.error.dark,
    },
  },
}));
async function handleDelete() {
  await mainThreadDB.delete();
  localStorage.removeItem("persist:root");
  window.location.reload();
}
export const DeleteAllButton: FunctionComponent = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const classes = useStyles();
  const exampleCountQuery = useExampleCount();
  if (!exampleCountQuery.data) {
    return null;
  }
  return (
    <>
      <Button onClick={() => setOpen(true)} className={classes.button}>
        Start Over
      </Button>
      <Dialog color={"danger"} open={open} onClose={() => setOpen(false)}>
        <DialogTitle className={classes.header}>
          <Typography variant={"h3"}>Delete All Data ?</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant={"h4"} gutterBottom={true}>
            Your about to delete all of the work you've done.
          </Typography>
          <Typography variant={"h4"} gutterBottom={true}>
            Are you sure you want to ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <DownloadButton />
          <Button
            variant={"outlined"}
            onClick={handleDelete}
            className={classes.button}
          >
            Yes I'm Sure
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default DeleteAllButton;
