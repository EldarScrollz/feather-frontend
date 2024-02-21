import "./TopTags.scss";

import { Link } from "react-router-dom";

import { useGetTopTagsQuery } from "../../../redux/posts/postsApi";

export const TopTags = (/*{ tags }: { tags: string[] }*/) => {
    const { data: topTags, error: topTagsError, isLoading: isLoadingTopTags } = useGetTopTagsQuery();

    if (topTagsError) {
        return <div className="top-tags"><strong className="error">Could not get the tags, please try again later.</strong></div>
    }
    if (!topTags || topTags.length <= 0) return <></>;



    return (
        <div className="top-tags">
            <ul>
                {topTags.map((e, key) => { return <li key={key}> <Link to={`/posts/tag/${e}`} >{"#" + e}</Link></li>; })}
            </ul>
        </div>
    );
};