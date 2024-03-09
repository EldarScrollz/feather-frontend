import "./TagPage.scss";
import "../Home.scss";

import { IPost } from "../../../models/IPost";

import { useAppSelector } from "../../../redux/hooks";
import { useGetPostsQuery } from "../../../redux/posts/postsApi";
import { RootState } from "../../../redux/store";

import { useParams } from "react-router-dom";

import { Post } from "../post/Post";
import { SortPosts } from "../../../components/sortPosts/SortPosts";
import { LoadingScreen } from "../../../components/loadingScreen/LoadingScreen";
import { TopTags } from "../topTags/TopTags";
import { useEffect, useState } from "react";



export const TagPage = () => {
    const { tag } = useParams();

    const sortByState = useAppSelector((state: RootState) => state.posts.sortBy);
    const [sortBy, setSortBy] = useState("");
    const { data: posts, error: postsError, isLoading: isLoadingPosts, isFetching: isFetchingPosts } = useGetPostsQuery(sortBy);

    const postsWithTag = posts?.filter((e: IPost) => { return tag && e.tags?.includes(tag); });



    useEffect(() => {
        setSortBy(sortByState);
    }, [sortByState]);



    if (postsError) return <p className="error">Could not get the posts, please try again later.</p>;
    if (isLoadingPosts || isFetchingPosts) return <LoadingScreen />;



    return (
        <div className="tag-page">
            <div className="home">
                <div className="tag-page__tag">
                    <p>{tag}</p>
                </div>

                <TopTags />

                <SortPosts />

                <div className="home__posts">
                    {postsWithTag?.map((e: IPost) => { return <Post post={e} key={e._id} />; })}
                </div>
            </div>
        </div>
    );
};