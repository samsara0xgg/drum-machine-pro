import { Add, Menu, Save, Update } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Card,
  IconButton,
  Paper,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import Playbutton from "./Header/PlayButton.component";
// import MyButton from "./Header/MyButton.component";
import Slider from "./Header/Slider.component";

const Header = (props) => {
  const StyledAppBar = styled(AppBar)(({ theme }) => ({
    display: "flex",
  }));

  const StyledButton = styled(Button)(({ theme }) => ({
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.87)",
    fontSize: "12px",
    marginLeft: "1vw",
    padding: "8px 16px",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.05)",
      color: "#CBFF8B",
    },
  }));

  // useEffect(() => {
  //   const context = new AudioContext();
  //   const playButton = document.querySelector(`#channel0`);

  //   let yodelBuffer;
  //   console.log(2);

  //   window
  //     .fetch("assets/audio/707-bd.mp3")
  //     .then((response) => response.arrayBuffer())
  //     .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
  //     .then((audioBuffer) => {
  //       playButton.disabled = false;
  //       yodelBuffer = audioBuffer;
  //     });

  //   playButton.onclick = () => {
  //     play(yodelBuffer);
  //   };

  //   function play(audioBuffer) {
  //     const source = context.createBufferSource();
  //     source.buffer = audioBuffer;
  //     source.connect(context.destination);
  //     source.start();
  //   }
  // }, []);
  return (
    <StyledAppBar position="static">
      <Paper elevation={5}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          <Box sx={{ mr: 1, flexGrow: 1, display: "flex" }}>
            <Slider label="volume" id="1" defaultValue="80" />
            <Slider label="BPM" id="BPM" min="40" max="200" defaultValue="120" />
          </Box>
          <StyledButton sx={{ boxShadow: 3 }} startIcon={<Save />}>
            Save
          </StyledButton>
          <StyledButton sx={{ boxShadow: 3 }} startIcon={<Add />}>
            New
          </StyledButton>
          <StyledButton sx={{ boxShadow: 3 }} startIcon={<Update />}>
            Update
          </StyledButton>
        </Toolbar>
      </Paper>
    </StyledAppBar>
  );
};
export default Header;

{
  /* <div className="Header">
  <Playbutton />
  <div className="sliderControl" style={{ marginRight: "20vw" }}>
    <Slider label="volume" id="1" />
    <Slider label="BPM" id="2" />
  </div>
 
  <button id="test2">channel</button>
</div> */
}

// import React, { useEffect } from "react";
// import Playbutton from "./Header/PlayButton.component";
// import SaveIcon from "@mui/icons-material/Save";
// import AddIcon from "@mui/icons-material/Add";
// import BackupIcon from "@mui/icons-material/Backup";
// // import MyButton from "./Header/MyButton.component";
// import Slider from "./Header/Slider.component";

// const Header = (props) => {
//   useEffect(() => {
//     const context = new AudioContext();
//     const playButton = document.querySelector(`#channel0`);

//     let yodelBuffer;
//     console.log(2);

//     window
//       .fetch("assets/audio/707-bd.mp3")
//       .then((response) => response.arrayBuffer())
//       .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
//       .then((audioBuffer) => {
//         playButton.disabled = false;
//         yodelBuffer = audioBuffer;
//       });

//     playButton.onclick = () => {
//       play(yodelBuffer);
//     };

//     function play(audioBuffer) {
//       const source = context.createBufferSource();
//       source.buffer = audioBuffer;
//       source.connect(context.destination);
//       source.start();
//     }
//   }, []);
//   return (
//     <div className="Header">
//       <Playbutton />
//       <div className="sliderControl" style={{ marginRight: "20vw" }}>
//         <Slider label="volume" id="1" />
//         <Slider label="BPM" id="2" />
//       </div>
//       <div style={{ marginRight: "2vw" }}>
//         <MyButton startIcon={<SaveIcon />} variant="contained">
//           Save
//         </MyButton>
//         <MyButton startIcon={<AddIcon />} variant="contained">
//           New
//         </MyButton>
//         <MyButton startIcon={<BackupIcon />} variant="contained">
//           Upload
//         </MyButton>
//       </div>
//       <button id="test2">channel</button>
//     </div>
//   );
// };
// export default Header;
