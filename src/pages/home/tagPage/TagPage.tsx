import "./TagPage.scss";
import "../Home.scss";

import { IPost } from "../../../models/IPost";

import { useAppDispatch } from "../../../redux/hooks";
import { fetchPosts } from "../../../redux/posts/postsSlice";
import { useGetPostsQuery, useGetTopTagsQuery } from "../../../redux/posts/postsApi";

import { useParams } from "react-router-dom";
import { useEffect } from "react";

import { Post } from "../post/Post";
import { SortPosts } from "../../../components/sortPosts/SortPosts";
import { LoadingScreen } from "../../../components/loadingScreen/LoadingScreen";
import { TopTags } from "../topTags/TopTags";

export const TagPage = () => {
    const dispatch = useAppDispatch();
    const { tag } = useParams();

    const { data: posts, error: postsError, isLoading: isLoadingPosts } = useGetPostsQuery();

    useEffect(() => { dispatch(fetchPosts()); }, [dispatch]);

    const postsWithTag = posts?.filter((e: IPost) => { return tag && e.tags?.includes(tag); });



    if (isLoadingPosts) return <LoadingScreen />;



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