import "../home/post/Post.scss";
import commentsIcon from "../home/post/commentsIcon.svg";
import viewsIcon from "../home/post/viewsIcon.svg";

import deleteIcon from "../home/post/deleteIcon.svg";
import editIcon from "../home/post/editIcon.svg";
import heartsIcon from "../home/post/heartsIcon.svg";

import { IComment } from "../../models/IComment";
import { Comment } from "./commentSection/Comment";

import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { PulseLoader } from "react-spinners";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { signOut } from "../../redux/auth/authSlice";
import { useDeletePostMutation, useGetPostQuery } from "../../redux/posts/postsApi";
import { useCreateHeartMutation, useDeleteHeartMutation, useHasUserHeartedPostQuery } from "../../redux/hearts/heartsApi";

import { LoadingScreen } from "../../components/loadingScreen/LoadingScreen";
import { Modal } from "../../components/modal/Modal";

import { formatRelativeTime } from "../../utils/relativeTimeFormatter";
import { useCreateCommentMutation, useGetCommentsByPostIdQuery } from "../../redux/comments/commentsApi";



export const FullPost = () => {
    const { id: postId } = useParams();
    const navigate = useNavigate();

    const userData = useAppSelector((state) => state.auth.userData);
    const dispatch = useAppDispatch();

    // Get post.
    const { data: post, error: postError, isLoading: isLoadingPost } = useGetPostQuery(postId);
    const [deletePost] = useDeletePostMutation();

    // Has user hearted post.
    const { data: heartData, error: heartError, isLoading: isLoadingHeart } = useHasUserHeartedPostQuery(
        { postId, userId: userData?._id },
        { skip: postId === undefined || userData?._id === undefined });
    // Create heart.
    const [createHeart] = useCreateHeartMutation();
    // Delete heart.
    const [deleteHeart] = useDeleteHeartMutation();

    // Get comments by post id.
    const { data: comments, isLoading: isLoadingComments } = useGetCommentsByPostIdQuery(postId,
        { skip: postId === undefined });

    // Create comment.
    const [createComment] = useCreateCommentMutation();

    const [isHeartLoading, setIsHeartLoading] = useState(false);
    const [heartsCount, setHeartsCount] = useState(0);
    const [isUserInHearts, setIsUserInHearts] = useState(false);
    const [showModal, setShowModal] = useState(false);


    const [isFullPostLoading, setIsFullPostloading] = useState(true);
    const [isCommentLoading, setIsCommentLoading] = useState(false);

    const moddedDate = post && formatRelativeTime(new Date(post.createdAt));
    const [fullPostCommentsCount, setFullPostCommentsCount] = useState(0);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [createdCommentText, setCreatedCommentText] = useState("");
    const [createdCommentErrorMsg, setCreatedCommentErrorMsg] = useState("");



    useEffect(() => {
        (async () => {
            try {
                if (post) {
                    setHeartsCount(post.heartsCount);
                    setFullPostCommentsCount(post.commentsCount);
                }

                // Check if user already "hearted" this post.
                setIsUserInHearts(heartData ? true : false);
            } catch (error: any) { // todo: change error type.
                console.error("Could not get the all the fullpost data", error);
                if (error.response.status === 403) dispatch(signOut());
            }
            finally { setIsFullPostloading(false); }
        })();
    }, [userData, postId, post, heartData, dispatch]);



    if (!postId) { return <p className="error">Error: Post ID not found</p>; }



    const addRemoveHeart = async () => {
        setIsHeartLoading(true);

        try {
            if (!isUserInHearts) {
                post?._id && await createHeart(post?._id).unwrap();

                setHeartsCount(prev => prev + 1);

                setIsUserInHearts(true);
            }
            else if (isUserInHearts) {
                (post?._id && userData?._id) && await deleteHeart({ postId: post?._id, userId: userData?._id }).unwrap();

                setHeartsCount(prev => prev - 1);
                setIsUserInHearts(false);
            }
        }
        catch (error) { console.error("Could not add/remove the heart!", error); }

        setIsHeartLoading(false);
    };



    const handleDeletePost = async () => {
        try {
            post?._id && await deletePost(post?._id).unwrap();
            navigate("/");
        }
        catch (error) {
            console.error("Could not delete the post!", error);
        }
    };



    const resizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'inherit';
        e.target.style.height = `${e.target.scrollHeight}px`;

        const commentText = e.target.value;
        if (commentText.length >= 1000) { return setCreatedCommentErrorMsg("Max. comment lenght is 1000 chars."); }
        setCreatedCommentErrorMsg("");

        setCreatedCommentText(commentText);
    };



    const handelCreateComment = async () => {
        if (createdCommentErrorMsg.length > 0 || !createdCommentText || !userData) return;

        setIsCommentLoading(true);

        const body =
        {
            postId: postId,
            commentParentId: null,
            text: createdCommentText,
            user: userData?._id,
        };

        try { await createComment(body).unwrap(); }
        catch (error) { console.error("Could not create the comment", error); }

        textareaRef.current!.value = "";
        setCreatedCommentText("");
        textareaRef.current && (textareaRef.current.style.height = "29px");
        setFullPostCommentsCount(prev => prev + 1);

        setIsCommentLoading(false);
    };



    // Checks ----------------------------------------------------------------------------------------------------------------------
    if (!userData) return <p className="error">{"Sign in to view the post"}</p>;

    // todo: "!post" is probably not good.
    if (postError) { return <p className="error">Could not get the post, please try again later.</p>; }

    if (isLoadingPost || isLoadingComments || isFullPostLoading) return <LoadingScreen />;

    if (!post) { return <p className="error">Could not get the post, please try again later.</p>; }
    //------------------------------------------------------------------------------------------------------------------------------



    return (
        <div className="full-post">

            <div className="post">
                {userData._id === post.user._id &&
                    <div className="post__options">
                        <button onClick={() => setShowModal(true)} className="post__delete"><img src={deleteIcon} alt="" /></button>
                        <button onClick={() => navigate(`/posts/${post._id}/edit`)} className="post__edit"><img src={editIcon} alt="edit icon" /></button>
                    </div>
                }

                {(post.postImg && post.postImg !== process.env.REACT_APP_NOIMG) &&
                    <div className="post__image-container">
                        <img className="post__image" src={process.env.REACT_APP_BACKEND + post.postImg} alt="Post full preview" />
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
                    <h2>{post.title}</h2>
                </div>

                <div className="post__description">
                    <ReactMarkdown className="post__description-text" children={post.text} />
                </div>

                <div className="post__footer">
                    <div className="post__footer-left-wrapper">
                        <div className="post__footer-views"><img src={viewsIcon} alt="views icon" /> <p>{post.viewsCount}</p></div>
                        <div className="post__footer-comments"><img src={commentsIcon} alt="comments icon" /> <p>{fullPostCommentsCount}</p></div>
                    </div>

                    {!isHeartLoading
                        ? <button className="post__footer-hearts" style={{ backgroundColor: isUserInHearts ? "#113b1f" : "" }} onClick={addRemoveHeart}>{heartsCount} <img src={heartsIcon} alt="hearts icon" /></button>
                        : <button className="post__footer-hearts"><PulseLoader color={"#c2cad1"} size={5} /></button>
                    }
                </div>
            </div>

            <div className="full-post__comments-section">
                {createdCommentErrorMsg && <p className="full-post__error-msg">{createdCommentErrorMsg}</p>}

                <div className="full-post__comment-form">
                    <img src={process.env.REACT_APP_BACKEND + userData.userAvatar} alt="Your avatar" />

                    <div className="full-post__comment-form-input">
                        <textarea ref={textareaRef} placeholder="Add a comment..." rows={1} onChange={(e) => resizeTextarea(e)} />

                        <div className="full-post__comment-form-buttons">
                            <button className="full-post__clear-comment-text" onClick={() => { textareaRef.current!.value = ""; setCreatedCommentText(""); textareaRef.current && (textareaRef.current.style.height = "29px"); }}>clear</button>

                            {!isCommentLoading
                                ? <button className="full-post__create-comment" onClick={handelCreateComment}>comment</button>
                                : <button><PulseLoader color={"#c52b2b"} size={7} /></button>
                            }
                        </div>
                    </div>
                </div>

                {comments
                    ?.filter((e: IComment) => e.commentParentId === null)
                    .map((e: IComment) => { return <Comment key={e._id} comment={e} fullPostCommentsCount={fullPostCommentsCount} setFullPostCommentsCount={setFullPostCommentsCount} />; })
                }
            </div>

            {showModal && <Modal text={"Delete the post?"} setShowModal={setShowModal} performAction={() => handleDeletePost()} />}
        </div>
    );
};