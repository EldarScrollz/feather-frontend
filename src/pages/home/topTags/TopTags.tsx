import "./TopTags.scss";

import { Link } from "react-router-dom";
import { PulseLoader } from "react-spinners";

import { useGetTopTagsQuery } from "../../../redux/posts/postsApi";



export const TopTags = () => {
    const { data: topTags, error: topTagsError, isLoading: isLoadingTopTags } = useGetTopTagsQuery();



    if (topTagsError) return <div className="top-tags"><p className="error">Tags error, please try again later.</p></div>;

    if (isLoadingTopTags) return (
        <div className="top-tags" style={{ display: "flex", justifyContent: "center" }}>
            <PulseLoader color={"#c4c7ad"} size={7} />
        </div>
    );

    if (!topTags || topTags.length <= 0) return <></>;





    return (
        <div className="top-tags">
            <ul>
                {topTags.map((e, key) => { return <li key={key}> <Link to={`/posts/tag/${e}`} >{"#" + e}</Link></li>; })}
            </ul>
        </div>
    );
};