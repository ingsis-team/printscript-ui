import {createContext, useContext} from 'react'
import {AlertColor} from "@mui/material";

export type SnackBarType  = {
  severity: AlertColor,
  text: string
}

export type SnackbarContextType = {
  active: SnackBarType[],
  createSnackbar: (severity: AlertColor, text: string) => void
}


export const SnackbarContext = createContext<SnackbarContextType>({
  active: [],
  createSnackbar: () => {},
});


export const useSnackbarContext = (): SnackbarContextType => useContext(SnackbarContext)
