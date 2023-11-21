import { createAction } from "@reduxjs/toolkit";
import { Artboard } from "../../App";

export enum ApplicationActionType {
  APP_START = "app/appStart",
  INIT_STATE = "app/initState",
  SET_ARTBOARDS = "app/setArtboards",
}

export const appStart = createAction(ApplicationActionType.APP_START);

export const initState = createAction<Artboard[]>(
  ApplicationActionType.INIT_STATE
);

export const setArtboards = createAction<Array<Artboard>>(
  ApplicationActionType.SET_ARTBOARDS
);
