import type { Case } from '../types';
import { cases as easyCases } from './cases/easy';
import { mediumCases } from './cases/medium';
import { hardCases } from './cases/hard';
import { seniorCases } from './cases/senior';
import { specialCases } from './cases/special';
import { expertCases } from './cases/expert';

export const cases: Case[] = [
  ...easyCases,
  ...mediumCases,
  ...hardCases,
  ...seniorCases,
  ...specialCases,
  ...expertCases,
];
