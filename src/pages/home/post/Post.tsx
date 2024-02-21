import "./Post.scss";
import deleteIcon from "./deleteIcon.svg"
import editIcon from "./editIcon.svg"
import viewsIcon from "./viewsIcon.svg";
import commentsIcon from "./commentsIcon.svg";
import heartsIcon from "./heartsIcon.svg"

import { IPost } from "../../../models/IPost";

import {axiosCustom} from "../../../axiosSettings";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { updateHeartsCount } from "../../../redux/posts/postsSlice";
import { PulseLoader } from "react-spinners";
import { formatRelativeTime } from "../../../utils/relativeTimeFormatter";
import { Modal } from "../../../components/modal/Modal";



interface IPostProps { post: IPost; }

export const Post = ({ post }: IPostProps) =>
{
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const userData = useAppSelector((state) => state.auth.userData);

    const moddedDate = formatRelativeTime(new Date(post.createdAt));

    const [showPost, setShowPost] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [isHeartLoading, setIsHeartLoading] = useState(true);
    const [isUserInHearts, setIsUserInHearts] = useState(false);

    const formatViewsCount = Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(post.viewsCount);
    const formatCommentsCount = Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(post.commentsCount);
    const [formatHeartsCount, setFormatHeartsCount] = useState(Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(post.heartsCount));


    useEffect(() =>
    {
        if (userData?._id)
        {
            // Check if user already "hearted" this post
            axiosCustom.get(`hearts/hasUserHeart/${post._id}/${userData?._id}`)
                .then((res) => 
                {
                    setIsUserInHearts(res.data);
                })
                .catch((error) => console.warn("Could not get hasUserHeart", error))
                .finally(() => setIsHeartLoading(false));
        }
        else { setIsHeartLoading(false); }
    }, [post._id, userData?._id]);



    const deletePost = async () =>
    {
        try 
        {
            await axiosCustom.delete(`/posts/${post._id}`);

            setShowPost(false);
        }
        catch (error) { console.error("Could not delete the post", error); }
    };



    const addRemoveHeart = async () =>
    {
        setIsHeartLoading(true);

        try 
        {
            if (!isUserInHearts)
            {
                await axiosCustom.post(`/hearts/${post._id}`);

                // Increase heartsCount (redux) ----------------------------------
                const payload = { _id: post._id, count: (post.heartsCount + 1) };
                dispatch(updateHeartsCount(payload));
                //----------------------------------------------------------------

                setFormatHeartsCount(Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(post.heartsCount + 1));

                setIsUserInHearts(true);
            }
            else if (isUserInHearts)
            {
                await axiosCustom.delete(`/hearts?postId=${post._id}&userId=${userData?._id}`);

                // Decrease heartsCount (redux) ----------------------------------
                const payload = { _id: post._id, count: (post.heartsCount - 1) };
                dispatch(updateHeartsCount(payload));
                //----------------------------------------------------------------

                setFormatHeartsCount(Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(post.heartsCount - 1));

                setIsUserInHearts(false);
            }
        }
        catch (error) { console.error("Could not add/remove the heart!", error); }

        setIsHeartLoading(false);
    };



    if (!showPost) { return <></>; }



    return (
        <>
            <div className={(userData?._id === post.user._id) ? "post post--ownedPost" : "post"}>

                {userData?._id === post.user._id &&
                    <div className="post__options">
                        <button onClick={() => setShowModal(true)} className="post__delete"><img src={deleteIcon} alt="" /></button>
                        <button onClick={() => navigate(`/posts/${post._id}/edit`)} className="post__edit"><img src={editIcon} alt="edit icon" /></button>
                    </div>
                }

                {(post.postImg && post.postImg !== process.env.REACT_APP_NOIMG) &&
                    <div className="post__image-container">
                        <Link to={`/posts/${post._id}`}>
                            <img className="post__image" src={process.env.REACT_APP_BACKEND + post.postImg} alt="Post preview" />
                        </Link>
                    </div>
                }

                <div className="post__about-author">
                    <img className="post__avatar" src={process.env.REACT_APP_BACKEND + post.user.userAvatar} alt="Author's avatar" />
                    <div className="post__post-details">
                        <div className="post__author"><p>{post.user.name}</p></div>
                        {post.tags.length !== 0 ? <ul className="post__tags">{post.tags.map((e, key) => { return <li key={key}> <Link to={`/posts/tag/${e}`} >{"#" + e}</Link></li>; })}</ul> : <p>...</p>}
                        <div className="post__date"><p>{moddedDate}</p></div>
                    </div>
                </div>

                <div className="post__title">
                    <Link to={`/posts/${post._id}`}>{post.title}</Link>
                </div>

                <div className="post__description">
                    <ReactMarkdown className="post__description-text" children={post.text} />
                </div>

                <div className="post__footer">
                    <div className="post__footer-left-wrapper">
                        <div className="post__footer-views"><img src={viewsIcon} alt="views icon" /> <p>{formatViewsCount}</p></div>
                        <div className="post__footer-comments"><img src={commentsIcon} alt="comments icon" /> <p>{formatCommentsCount}</p></div>
                    </div>

                    {!isHeartLoading
                        ? <button className="post__footer-hearts" style={{ backgroundColor: isUserInHearts ? "#113b1f" : "" }} onClick={addRemoveHeart}>{formatHeartsCount} <img src={heartsIcon} alt="hearts icon" /></button>
                        : <button className="post__footer-hearts"><PulseLoader color={"#c2cad1"} size={5} /></button>
                    }
                </div>

            </div>

            {showModal && <Modal text={"Delete the post?"} setShowModal={setShowModal} performAction={deletePost} />}
        </>
    );
};