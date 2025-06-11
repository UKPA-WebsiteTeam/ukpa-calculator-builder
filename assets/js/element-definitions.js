import numberDefinition from './elements/Inputs/number/index.js';
import dropdownDefinition from './elements/Inputs/dropdown/index.js';
import dateDefinition from './elements/Inputs/date/index.js';
import checkboxDefinition from './elements/Inputs/checkbox/index.js';
import radioDefinition from './elements/Inputs/radio/index.js';
import textDefinition from './elements/Inputs/text/index.js';
import emailDefinition from './elements/Inputs/email/index.js';

import mainResultDefinition from './elements/Results/mainResult/index.js';
import breakdownDefinition from './elements/Results/breakdown/index.js';
import barChartDefinition from './elements/Results/barChart/index.js';
import otherResultDefinition from "./elements/Results/otherResult/index.js";
import disclaimerDefinition from './elements/Results/disclaimer/index.js';

import headerDefinition from './elements/Contents/header/index.js';
import textBlockDefinition from './elements/Contents/textBlock/index.js';
import imageDefinition from './elements/Contents/image/index.js';
import videoDefinition from './elements/Contents/video/index.js';
import linkDefinition from './elements/Contents/link/index.js'; 
import buttonDefinition from './elements/Contents/button/index.js';
import contentBlockDefinition from './elements/Contents/contentBlock/index.js';

import wrapperDefinition from './elements/Wrappers/wrapper/index.js';


export const ukpaElementDefinitions = {


  // Input Elements
  number:numberDefinition,
  dropdown: dropdownDefinition,
  date: dateDefinition,
  checkbox: checkboxDefinition,
  radio: radioDefinition,
  text: textDefinition,
  email: emailDefinition,

  // Result Elements
  mainResult: mainResultDefinition,
  breakdown: breakdownDefinition,
  barChart: barChartDefinition,
  otherResult: otherResultDefinition,
  disclaimer: disclaimerDefinition,

  //content Elements
  header: headerDefinition,
  textBlock: textBlockDefinition,
  image: imageDefinition,
  video: videoDefinition,
  link: linkDefinition,
  button: buttonDefinition,
  contentBlock: contentBlockDefinition,

  // Wrapper Element
  wrapper: wrapperDefinition
};
