// Input Elements
import number from './elements/Inputs/number/index.js';
import text from './elements/Inputs/text/index.js';
import email from './elements/Inputs/email/index.js';
import date from './elements/Inputs/date/index.js';
import dropdown from './elements/Inputs/dropdown/index.js';
import radio from './elements/Inputs/radio/index.js';
import checkbox from './elements/Inputs/checkbox/index.js';

// Content Elements
import header from './elements/Contents/header/index.js';
import textBlock from './elements/Contents/textBlock/index.js';
import image from './elements/Contents/image/index.js';      // folder name must be lowercase
import video from './elements/Contents/video/index.js';      // must match folder exactly
import link from './elements/Contents/link/index.js';
import button from './elements/Contents/button/index.js';
import contentBlock from './elements/Contents/contentBlock/index.js';
import disclaimer from './elements/Contents/disclaimer/index.js';

// Result Elements
import mainResult from './elements/Results/mainResult/index.js';
import breakdown from './elements/Results/breakdown/index.js';
import barChart from './elements/Results/barChart/index.js';
import otherResult from './elements/Results/otherResult/index.js';

// Wrapper Element
import wrapper from './elements/Wrappers/wrapper/index.js';

export const ukpaElementDefinitions = {
  number,
  text,
  email,
  date,
  dropdown,
  radio,
  checkbox,
  header,
  textBlock,
  image,
  video,
  link,
  button,
  contentBlock,
  disclaimer,
  mainResult,
  breakdown,
  barChart,
  otherResult,
  wrapper
};
