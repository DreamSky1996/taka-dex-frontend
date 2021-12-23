import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import PersonIcon from '@material-ui/icons/Person';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import { blue } from '@material-ui/core/colors';
import { tokens, IToken, getTokenSymbol } from "../../../constants/tokens";


const useStyles = makeStyles({
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  },
});

export interface TokenDialogProps {
  open: boolean;
  onClose: (value: IToken|null) => void;
}

export default function TokenDialog(props: TokenDialogProps) {
  const classes = useStyles();
  const { onClose, open } = props;

  const handleClose = () => {
    onClose(null);
  };

  const handleListItemClick = (value: IToken) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">Select Token</DialogTitle>
      <List>
        {tokens.map((item) => (
          <ListItem button onClick={() => handleListItemClick(item)} key={item.address}>
            <ListItemAvatar>
              <Avatar className={classes.avatar} src={item.logoURI}/>
            </ListItemAvatar>
            <ListItemText primary={item.symbol} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}
