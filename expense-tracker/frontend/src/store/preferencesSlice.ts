import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PreferencesState = {
  theme: "light" | "system";
};

const initialState: PreferencesState = {
  theme: "light",
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<"light" | "system">) {
      state.theme = action.payload;
    },
  },
});

export const { setTheme } = preferencesSlice.actions;
export const preferencesReducer = preferencesSlice.reducer;
