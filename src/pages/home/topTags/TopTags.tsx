import "./TopTags.scss";

import { Link } from "react-router-dom";

export const TopTags = ({ tags }: { tags: { items: string[]; }; }) =>
{
    if(tags.items.length <= 0) return <></>

    return (
        <div className="top-tags">
            <ul>
                {tags.items.map((e, key) => { return <li key={key}> <Link to={`/posts/tag/${e}`} >{"#" + e}</Link></li>; })}
            </ul>
        </div>
    );
};