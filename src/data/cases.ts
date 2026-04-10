import type { Case } from '../types';
import { cases as easyCases } from './cases/easy';
import { mediumCases } from './cases/medium';
import { hardCases } from './cases/hard';

export const cases: Case[] = [...easyCases, ...mediumCases, ...hardCases];
