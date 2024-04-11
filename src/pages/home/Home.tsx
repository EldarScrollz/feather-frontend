import "./Home.scss";

import { IPost } from "../../models/IPost";

import { useGetPostsQuery } from "../../redux/posts/postsApi";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";

import { Post } from "./post/Post";
import { TopTags } from "./topTags/TopTags";
import { SortPosts } from "../../components/sortPosts/SortPosts";
import { LoadingScreen } from "../../components/loadingScreen/LoadingScreen";

import { useEffect, useState } from "react";



export const Home = () => {
    const sortByState = useAppSelector((state: RootState) => state.posts.sortBy);
    const [sortBy, setSortBy] = useState("new posts");

    const { data: posts, error: postsError, isLoading: isLoadingPosts, isFetching:isFetchingPosts } = useGetPostsQuery(sortBy);

    const [animate, setAnimate] = useState("home__posts");

    useEffect(() => {
        if (window.sessionStorage.getItem("home-posts-slide-in") !== "false") {
            window.sessionStorage.setItem("home-posts-slide-in", "false");
            setAnimate("home__posts home__posts--animation");
        }

        setSortBy(sortByState);
    }, [sortByState]);


    //todo: make msg when too many request (for other components too).
    if (postsError) { return <p className="error">Could not get the posts, please try again later.</p>; }
    if (isLoadingPosts || isFetchingPosts) return <LoadingScreen />;



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