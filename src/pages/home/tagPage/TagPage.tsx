import "./TagPage.scss";
import "../Home.scss";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

import { IPostProps } from "../Home";
import { Post } from "../post/Post";
import { fetchPosts } from "../../../redux/slices/postsSlice";
import { SortPosts } from "../../../components/sortPosts/SortPosts";
import { LoadingScreen } from "../../../components/loadingScreen/LoadingScreen";
import { TopTags } from "../topTags/TopTags";

export const TagPage = () =>
{
    const dispatch = useAppDispatch();
    const { tag } = useParams();

    const { posts, tags } = useAppSelector((state) => state.allPosts);
    const isPostsLoading = posts.status === "loading";

    useEffect(() => { dispatch(fetchPosts()); }, [dispatch]);

    const postsWithTag = posts.items.filter((e: IPostProps) => { return tag && e.tags?.includes(tag); });



    if (isPostsLoading) return <LoadingScreen />;



    return (
        <div className="tag-page">
            <div className="home">
                <div className="tag-page__tag">
                    <p>{tag}</p>
                </div>

                <TopTags tags={tags} />

                <SortPosts />

                <div className="home__posts">
                    {postsWithTag.map((e: IPostProps) => { return <Post post={e} key={e._id} />; })}
                </div>
            </div>
        </div>
    );
};