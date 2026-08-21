import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { keyframes } from "@emotion/react";

const enter = keyframes`
  0% {
    transform: scale(0);
    opacity: 0.1;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
`;

const MyButton = styled(Button)(({ theme }) => ({
  backgroundColor: "rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.87)",
  fontSize: "12px",
  marginLeft: "1vw",
  padding: "8px 16px",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#CBFF8B",
  },
  "& .MuiTouchRipple-child": {
    backgroundColor: "#CBFF8B",
  },
  "& .MuiTouchRipple-rippleVisible": {
    opacity: 0.5,
    animation: `${enter} 550ms ${theme.transitions.easing.easeInOut}`,
  },
}));

export default MyButton;
