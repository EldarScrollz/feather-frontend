import "./TagPage.scss";
import "../Home.scss";

import { IPost } from "../../../models/IPost";

import { useGetPostsQuery } from "../../../redux/posts/postsApi";

import { useParams } from "react-router-dom";

import { Post } from "../post/Post";
import { SortPosts } from "../../../components/sortPosts/SortPosts";
import { LoadingScreen } from "../../../components/loadingScreen/LoadingScreen";
import { TopTags } from "../topTags/TopTags";



export const TagPage = () => {
    const { tag } = useParams();

    const { data: posts, error: postsError, isLoading: isLoadingPosts } = useGetPostsQuery();

    const postsWithTag = posts?.filter((e: IPost) => { return tag && e.tags?.includes(tag); });


    
    if (postsError) return <p className="error">Could not get the posts, please try again later.</p>;
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