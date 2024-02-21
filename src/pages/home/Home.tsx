import "./Home.scss";

import { IPost } from "../../models/IPost";

import { useAppSelector } from "../../redux/hooks";
import { useGetPostsQuery, useGetTopTagsQuery } from "../../redux/posts/postsApi";

import { Post } from "./post/Post";
import { TopTags } from "./topTags/TopTags";
import { SortPosts } from "../../components/sortPosts/SortPosts";
import { LoadingScreen } from "../../components/loadingScreen/LoadingScreen";

import { useEffect, useState } from "react";



export const Home = () => {
    // const { posts, tags } = useAppSelector((state) => state.allPosts);
    // todo: log errors (in other files also (E.g. TagPage.tsx))
    const { data: posts, error: postsError, isLoading: isLoadingPosts } = useGetPostsQuery();

    console.log("postsError", postsError);


    const [animate, setAnimate] = useState("home__posts");



    useEffect(() => {
        if (window.sessionStorage.getItem("home-posts-slide-in") !== "false") {
            window.sessionStorage.setItem("home-posts-slide-in", "false");
            setAnimate("home__posts home__posts--animation");
        }
    }, []);



    if (isLoadingPosts) return <LoadingScreen />;
    if (postsError) { return <p className="error">Could not get the posts, please try again later.</p>; }



    return (
        <div className="home">
            <TopTags />

            <SortPosts />

            <div className={animate}>
                {posts?.map((e: IPost) => <Post post={e} key={e._id} />)}
            </div>
        </div>
    );
};