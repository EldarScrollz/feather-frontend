import "./sass/style.scss";

import { SignUp } from "./pages/signUp/SignUp";
import { SignIn } from "./pages/signIn/SignIn";
import { UserProfile } from "./pages/userProfile/UserProfile";
import { Home } from "./pages/home/Home";
import { FullPost } from "./pages/fullPost/FullPost";
import { CreatePost } from "./pages/createPost/CreatePost";
import { TagPage } from "./pages/home/tagPage/TagPage";

import { useAppDispatch } from "./redux/hooks";

import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { RootLayout } from "./layouts/RootLayout";
import { useGetSignedInUserQuery } from "./redux/auth/authApi";
import { setUserData } from "./redux/auth/authSlice";

function App() {
  const dispatch = useAppDispatch();
  const { data: auth } = useGetSignedInUserQuery();

  useEffect(() => {
    auth && dispatch(setUserData(auth));
  }, [dispatch, auth]); 



  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="/posts/:id" element={<FullPost />} />
        <Route path="/posts/tag/:tag" element={<TagPage />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/posts/:id/edit" element={<CreatePost />} />

        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/user-profile" element={<UserProfile />} />
      </Route>
    )
  );

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;