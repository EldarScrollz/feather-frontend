import "./Post.scss";
import deleteIcon from "./deleteIcon.svg";
import editIcon from "./editIcon.svg";
import viewsIcon from "./viewsIcon.svg";
import commentsIcon from "./commentsIcon.svg";
import heartsIcon from "./heartsIcon.svg";

import { IPost } from "../../../models/IPost";

import { useAppSelector } from "../../../redux/hooks";
import { useDeletePostMutation } from "../../../redux/posts/postsApi";
import { selectIsUserSignedIn } from "../../../redux/user/userSlice";
import { useCreateHeartMutation, useDeleteHeartMutation, useHasUserHeartedPostQuery } from "../../../redux/hearts/heartsApi";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { PulseLoader } from "react-spinners";

import { formatRelativeTime } from "../../../utils/relativeTimeFormatter";
import { Modal } from "../../../components/modal/Modal";



interface IPostProps { post: IPost; }

export const Post = ({ post }: IPostProps) => {
    const navigate = useNavigate();
    const moddedDate = formatRelativeTime(new Date(post.createdAt));

    const userData = useAppSelector((state) => state.auth.userData);
    const isUserSignedIn = useAppSelector(selectIsUserSignedIn);

    const { data: hasUserHearted, isLoading: isLoadingHasUserHearted, isFetching: isFetchingHasUserHearted } = useHasUserHeartedPostQuery(
        { postId: post._id, userId: userData?._id },
        { skip: post._id === undefined || userData?._id === undefined, });

    const [deletePost] = useDeletePostMutation();
    const [createHeart] = useCreateHeartMutation();
    const [deleteHeart] = useDeleteHeartMutation();

    const [showPost, setShowPost] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [isHeartSpinner, setIsHeartSpinner] = useState(false);

    const formatViewsCount = Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(post.viewsCount);
    const formatCommentsCount = Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(post.commentsCount);



    const handleDeletePost = async () => {
        try {
            await deletePost(post._id).unwrap();
            setShowPost(false);
        }
        catch (error) { console.error("Could not delete the post", error); }
    };



    const addRemoveHeart = async () => {
        if (!isUserSignedIn) return;

        setIsHeartSpinner(true);

        try {
            if (!hasUserHearted) { await createHeart(post._id).unwrap(); }
            else if (hasUserHearted) { userData && await deleteHeart({ postId: post._id, userId: userData?._id }).unwrap(); }
        }
        catch (error) { console.error("Could not add/remove the heart!", error); }

        setIsHeartSpinner(false);
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

                    {(isLoadingHasUserHearted || isFetchingHasUserHearted) || isHeartSpinner
                        ? <button className="post__footer-hearts"><PulseLoader color={"#c2cad1"} size={5} /></button>
                        : <button className="post__footer-hearts" style={{ backgroundColor: hasUserHearted ? "#113b1f" : "" }} onClick={addRemoveHeart}>{Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(post.heartsCount)} <img src={heartsIcon} alt="hearts icon" /></button>
                    }
                </div>

            </div>

            {showModal && <Modal text={"Delete the post?"} setShowModal={setShowModal} performAction={handleDeletePost} />}
        </>
    );
};