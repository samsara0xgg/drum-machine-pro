import React, { useContext } from "react";
import Item from "./Pattern/Item.component";
import { Context } from "../Context";
import { Card, Grid, Typography } from "@mui/material";

const Pattern = (props) => {
  const { patternList, setPatternList } = useContext(Context);

  const handleOptionChange = (e) => {
    const changedList = patternList.slice().fill(false);
    changedList[e.target.value - 1] = !changedList[e.target.value - 1];
    setPatternList(changedList);
  };

  const createItem = patternList.map((item, i) => (
    <Grid key={`pattern${i}`} item xs={2}>
      <Item
        index={i + 1}
        checked={item}
        handleOptionChange={handleOptionChange}
      />
    </Grid>
  ));

  return (
    <Card elevation={5} sx={{ p: 2, height: "100%" }}>
      <Grid container spacing={1} rowSpacing={1}>
        <Grid item xs={12}>
          <Typography sx={{ lineHeight: "40px" }} variant="h6">
            Pattern
          </Typography>
        </Grid>
        {createItem}
      </Grid>
    </Card>
  );
};
export default Pattern;

{
  /* 
<div className="Pattern-part">
            <div className="Pattern">
                <div className="Pattern-label">Pattern</div>
                {createItem()}
            </div>
        </div> */
}
