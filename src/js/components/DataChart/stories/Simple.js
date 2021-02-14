import React from 'react';

import { Box, DataChart, Grommet } from 'grommet';
import { grommet } from 'grommet/themes';

const data = [];
for (let i = 1; i < 8; i += 1) {
  const v = Math.sin(i / 2.0);
  data.push({
    percent: Math.abs(v * 100),
  });
}

export const Simple = () => (
  <Grommet theme={grommet}>
    <Box align="center" justify="start" pad="large">
      <DataChart data={data} series="percent" />
    </Box>
  </Grommet>
);

export default {
  title: 'Visualizations/DataChart/Simple',
};