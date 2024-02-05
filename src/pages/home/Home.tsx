import "./Home.scss";

import { IPost } from "../../models/IPost";

import { useAppSelector } from "../../redux/hooks";

import { Post } from "./post/Post";
import { TopTags } from "./topTags/TopTags";
import { SortPosts } from "../../components/sortPosts/SortPosts";
import { LoadingScreen } from "../../components/loadingScreen/LoadingScreen";
import { useEffect, useState } from "react";



export const Home = () =>
{
    const { posts, tags } = useAppSelector((state) => state.allPosts);

    const isTagsLoading = tags.status === "loading";
    const isPostsLoading = posts.status === "loading";

    const [animate, setAnimate] = useState("home__posts");



    useEffect(() =>
    {
        if (window.sessionStorage.getItem("home-posts-slide-in") !== "false")
        {
            window.sessionStorage.setItem("home-posts-slide-in", "false");
            setAnimate("home__posts home__posts--animation");
        }
    }, []);



    if (isTagsLoading || isPostsLoading) return <LoadingScreen />;



    return (
        <div className="home">
            <TopTags tags={tags} />

            <SortPosts />

            <div className={animate}>
                {posts.items.map((e: IPost) => <Post post={e} key={e._id} />)}
            </div>
        </div>
    );
};