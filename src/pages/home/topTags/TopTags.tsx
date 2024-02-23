import "./TopTags.scss";

import { Link } from "react-router-dom";

import { useGetTopTagsQuery } from "../../../redux/posts/postsApi";

import { LoadingScreen } from "../../../components/loadingScreen/LoadingScreen";
import { SquareLoader } from "react-spinners";

export const TopTags = () => {
    const { data: topTags, error: topTagsError, isLoading: isLoadingTopTags } = useGetTopTagsQuery();

    if (topTagsError) return <div className="top-tags"><p className="error">Tags error, please try again later.</p></div>;
    if (!topTags || topTags.length <= 0) return <></>;
    if (isLoadingTopTags) return (
        <div className="top-tags" style={{ display: "flex", justifyContent: "center" }}>
            <SquareLoader color={"#c52b2b"} size={80} />
        </div>
    );

    return (
        <div className="top-tags">
            <ul>
                {topTags.map((e, key) => { return <li key={key}> <Link to={`/posts/tag/${e}`} >{"#" + e}</Link></li>; })}
            </ul>
        </div>
    );
};