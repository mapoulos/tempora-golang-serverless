import { IdToken } from "@auth0/auth0-spa-js";
import {
  makeStyles,
  Theme,
  createStyles,
  Typography,
  CardHeader,
  CardContent,
  Card,
  TextField,
  Grid,
  Button,
  Paper,
  CardActions,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { AppDispatch } from "../../app/store";
import { selectIdToken } from "../user/userSlice";
import { CreateMeditationInput, uploadMp3 } from "./meditationService";
import { createMeditationThunk, selectCurrentMeditation, setCurrentMeditation } from "./meditationSlice";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formRoot: {
      margin: theme.spacing(1),
      // width: "25ch",
      // flexGrow: 1,
      display: "flex",
    },
    gridContainer: {
      display: "flex",
    },
    gridItem: {
      flexGrow: 1,
      spacing: theme.spacing(1)
    },
    nameField: {
      flexGrow: 1,
      // minWidth: 400,
      // width: "80%",
      justifyContent: "center",
      paddingBottom: theme.spacing(2),
    },
    meditationTextField: {
      flexGrow: 1,
      // minWidth: 400,
      // width: "80%",
      paddingBottom: theme.spacing(2),
    },
    toolbar: theme.mixins.toolbar,
    fileSelectRow: {
      // flexGrow: 1,
      // width: 400,
      // justifyContent: "flex-end",
      paddingBottom: theme.spacing(2),
    },
    selectFileTextField: {
      // flexGrow: 1,
      paddingBottom: theme.spacing(2),
      // overflow: "hidden",
    },
    submitButtonRow: {
      justifyContent: "flex-end",
    },
    selectFileButton: {
      paddingTop: theme.spacing(1),
    },
    cardFooter: {
      justifyContent: "flex-end",
      padding: theme.spacing(2),
    },
  })
);

export const CreateMeditation = () => {
  const dispatch = useDispatch<AppDispatch>()
  const idToken = useSelector(selectIdToken)
  const history = useHistory()
  const [state, setState] = useState({
	  audioFile: {} as File,
    meditation: {
      name: "",
      text: "",
      isPublic: false,
      uploadKey: ""
    },
    isSubmitEnabled: true
  })
  const classes = useStyles();

  const handleNameFieldChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      meditation: {
        ...state.meditation,
        name: evt.target.value || ""
      }
    })
  }
  const handleTextFieldChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      meditation: {
        ...state.meditation,
        text: evt.target.value || ""
      }
    })
  }



  const handleFileSelection = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    const files = evt.target?.files ?? []
    const file = files[0]

    if (idToken) {
      const key = await uploadMp3(file, idToken)
      setState({
		  ...state,
		  audioFile: file,
		  meditation:{
			  ...state.meditation,
			  uploadKey: key
		  }
	  })
    }
  };

  const handleIsPublicSelection = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      meditation: {
        ...state.meditation,
        isPublic: evt.target.checked
      }
    })
  };

  const handleSubmit = async () => {
    const createMeditationArgs: CreateMeditationInput = state.meditation
    try {
      const newMeditation = await dispatch(createMeditationThunk(createMeditationArgs, idToken as IdToken))
      dispatch(setCurrentMeditation(newMeditation))
      history.push("/")
    } catch(error) {
      console.error("There was a problem creating the meditation")
      console.error(error)
    }

  }

  return (
    <React.Fragment>
      <div className={classes.toolbar} />
      <Card>
        <CardHeader title="Create Meditation" />
        <CardContent>
          <form className={classes.formRoot} autoComplete="off">
            <Grid container className={classes.gridContainer}>
              <Grid item className={classes.gridItem} xs={12}>
                <TextField
                  required
                  fullWidth
                  id="meditationNameField"
                  color="secondary"
                  variant="outlined"
                  label="Meditation Name"
                  className={classes.nameField}
                  onChange={handleNameFieldChange}
                ></TextField>
              </Grid>
              <Grid item className={classes.gridItem} xs={12}>
                <TextField
                  required
                  fullWidth
                  id="meditationTextField"
                  variant="outlined"
                  color="secondary"
                  label="Meditation Text"
                  onChange={handleTextFieldChange}
                  className={classes.meditationTextField}
                  multiline
                  rows={15}
                ></TextField>
              </Grid>
              <Grid item className={classes.gridItem} xs={12}>
                <FormControlLabel control={
                  <Checkbox checked={state.meditation.isPublic} onChange={handleIsPublicSelection} />
                } label="Make Public?"  labelPlacement="start"/>
              </Grid>
              <Grid container direction="row" justify="flex-end">
                <Grid item className={classes.fileSelectRow} xs={2}>
                  <Button
                    style={{ height: "100%" }}
                    size="large"
                    component="label"
                    variant="outlined"
                    fullWidth
                  >
                    Choose MP3
                    <input
                      type="file"
                      hidden
                      accept=".mp3"
                      onChange={handleFileSelection}
                    ></input>
                  </Button>
                </Grid>
                <Grid item className={classes.fileSelectRow} xs={10}>
                  <TextField
                    variant="outlined"
                    label={state.audioFile?.name ?? "" }
                    InputProps={{ readOnly: true }}
                    fullWidth={true}
                  />
                </Grid>
              </Grid>
            </Grid>
          </form>
        </CardContent>
        <CardActions className={classes.cardFooter}>
          <Button disabled={!state.isSubmitEnabled} size="large" variant="outlined" style={{ height: 50 }} onClick={handleSubmit}>
            Submit
          </Button>
        </CardActions>
      </Card>
    </React.Fragment>
  );
};
