import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "BUSINESS_ADMIN";
  businessId: number | null;
};

type UserState = {
  user: SessionUser | null;
};

const initialState: UserState = {
  user: null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SessionUser>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;