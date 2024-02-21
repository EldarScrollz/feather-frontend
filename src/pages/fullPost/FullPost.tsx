import "../home/post/Post.scss";
import commentsIcon from "../home/post/commentsIcon.svg";
import viewsIcon from "../home/post/viewsIcon.svg";

import deleteIcon from "../home/post/deleteIcon.svg";
import editIcon from "../home/post/editIcon.svg";
import heartsIcon from "../home/post/heartsIcon.svg";

import { IPost } from "../../models/IPost";
import { IComment } from "../../models/IComment";
import { IHeart } from "../../models/IHeart";

import { axiosCustom } from "../../axiosSettings";

import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useNavigate } from "react-router-dom";

import { Comment } from "./commentSection/Comment";
import ReactMarkdown from "react-markdown";

import { LoadingScreen } from "../../components/loadingScreen/LoadingScreen";
import { PulseLoader } from "react-spinners";
import { formatRelativeTime } from "../../utils/relativeTimeFormatter";
import { Modal } from "../../components/modal/Modal";
import { fetchPosts } from "../../redux/posts/postsSlice";
import { signOut } from "../../redux/slices/authSlice";



export const FullPost = () => {
    const { id: postId } = useParams();

    const userInfo = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [isHeartLoading, setIsHeartLoading] = useState(false);
    const [heartsCount, setHeartsCount] = useState(0);
    const [isUserInHearts, setIsUserInHearts] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [isFullPostLoading, setIsFullPostloading] = useState(true);
    const [isCommentLoading, setIsCommentLoading] = useState(false);

    const [fullPostData, setFullPostData] = useState<IPost | null>(null);
    const moddedDate = fullPostData && formatRelativeTime(new Date(fullPostData.createdAt));
    const [fullPostCommentsCount, setFullPostCommentsCount] = useState(0);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [postComments, setPostComments] = useState<IComment[]>([]);
    const [createdCommentText, setCreatedCommentText] = useState("");
    const [createdCommentErrorMsg, setCreatedCommentErrorMsg] = useState("");



    useEffect(() => {
        (async () => {
            try {
                const { data: postData } = await axiosCustom.get<IPost>(`/posts/${postId}`);

                setFullPostData(postData);
                setHeartsCount(postData.heartsCount);
                setFullPostCommentsCount(postData.commentsCount);

                // Check if user already "hearted" this post
                const { data: heartData } = await axiosCustom.get<IHeart>(`hearts/hasUserHeart/${postId}/${userInfo.userData?._id}`);
                setIsUserInHearts(heartData ? true : false);

                const { data: commentsData } = await axiosCustom.get<IComment[]>(`/comments/${postId}`);
                setPostComments(commentsData);
            } catch (error: any) {
                console.error("Could not get the all the fullpost data", error);

                if (error.response.status === 403) dispatch(signOut());
            }
            finally { setIsFullPostloading(false); }
        })();
    }, [userInfo, postId, dispatch]);



    const addRemoveHeart = async () => {
        setIsHeartLoading(true);

        try {
            if (!isUserInHearts) {
                await axiosCustom.post(`/hearts/${fullPostData?._id}`);

                setHeartsCount(prev => prev + 1);

                setIsUserInHearts(true);
            }
            else if (isUserInHearts) {
                await axiosCustom.delete(`/hearts?postId=${fullPostData?._id}&userId=${userInfo.userData?._id}`);

                setHeartsCount(prev => prev - 1);

                setIsUserInHearts(false);
            }
        }
        catch (error) { console.error("Could not add/remove the heart!", error); }

        setIsHeartLoading(false);
    };



    const deletePost = async () => {
        try {
            await axiosCustom.delete(`/posts/${fullPostData?._id}`);
            dispatch(fetchPosts());
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



    const createComment = async () => {
        if (createdCommentErrorMsg.length > 0) return;
        if (!createdCommentText) return;

        setIsCommentLoading(true);

        const body =
        {
            postId: postId,
            commentParentId: null,
            text: createdCommentText,
            user: userInfo.userData?._id,
        };

        try {
            await axiosCustom.post("/comments", body);
            await axiosCustom.get(`/comments/${postId}`).then((res) => { setPostComments(res.data); });
        }
        catch (error) { console.error("Could not create the comment", error); }

        textareaRef.current!.value = "";
        setCreatedCommentText("");
        textareaRef.current && (textareaRef.current.style.height = "29px");
        setFullPostCommentsCount(prev => prev + 1);

        setIsCommentLoading(false);
    };



    // Checks ----------------------------------------------------------------------------------------------------------------------
    if ((userInfo.status !== "loading" && !userInfo.userData) || !userInfo.userData) return <p className="error">{"Sign in to view the post"}</p>;

    if (!fullPostData || !postComments || isFullPostLoading) return <LoadingScreen />;
    //------------------------------------------------------------------------------------------------------------------------------



    return (
        <div className="full-post">

            <div className="post">
                {userInfo.userData._id === fullPostData.user._id &&
                    <div className="post__options">
                        <button onClick={() => setShowModal(true)} className="post__delete"><img src={deleteIcon} alt="" /></button>
                        <button onClick={() => navigate(`/posts/${fullPostData._id}/edit`)} className="post__edit"><img src={editIcon} alt="edit icon" /></button>
                    </div>
                }

                {(fullPostData.postImg && fullPostData.postImg !== process.env.REACT_APP_NOIMG) &&
                    <div className="post__image-container">
                        <img className="post__image" src={process.env.REACT_APP_BACKEND + fullPostData.postImg} alt="Post full preview" />
                    </div>
                }

                <div className="post__about-author">
                    <img className="post__avatar" src={process.env.REACT_APP_BACKEND + fullPostData.user.userAvatar} alt="Author's avatar" />
                    <div className="post__post-details">
                        <div className="post__author"><p>{fullPostData.user.name}</p></div>
                        {fullPostData.tags.length !== 0 ? <ul className="post__tags">{fullPostData.tags.map((e, key) => { return <li key={key}> <Link to={`/posts/tag/${e}`} >{"#" + e}</Link></li>; })}</ul> : <p>...</p>}
                        <div className="post__date"><p>{moddedDate}</p></div>
                    </div>
                </div>

                <div className="post__title">
                    <h2>{fullPostData.title}</h2>
                </div>

                <div className="post__description">
                    <ReactMarkdown className="post__description-text" children={fullPostData.text} />
                </div>

                <div className="post__footer">
                    <div className="post__footer-left-wrapper">
                        <div className="post__footer-views"><img src={viewsIcon} alt="views icon" /> <p>{fullPostData.viewsCount}</p></div>
                        <div className="post__footer-comments"><img src={commentsIcon} alt="comments icon" /> <p>{fullPostData.commentsCount}</p></div>
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
                    <img src={process.env.REACT_APP_BACKEND + userInfo.userData.userAvatar} alt="Your avatar" />

                    <div className="full-post__comment-form-input">
                        <textarea ref={textareaRef} placeholder="Add a comment..." rows={1} onChange={(e) => resizeTextarea(e)} />

                        <div className="full-post__comment-form-buttons">
                            <button className="full-post__clear-comment-text" onClick={() => { textareaRef.current!.value = ""; setCreatedCommentText(""); textareaRef.current && (textareaRef.current.style.height = "29px"); }}>clear</button>

                            {!isCommentLoading
                                ? <button className="full-post__create-comment" onClick={createComment}>comment</button>
                                : <button><PulseLoader color={"#c52b2b"} size={7} /></button>
                            }
                        </div>
                    </div>
                </div>

                {postComments
                    .filter((e: IComment) => e.commentParentId === null)
                    .map((e: IComment) => { return <Comment key={e._id} comment={e} fullPostCommentsCount={fullPostCommentsCount} setFullPostCommentsCount={setFullPostCommentsCount} />; })
                }
            </div>

            {showModal && <Modal text={"Delete the post?"} setShowModal={setShowModal} performAction={() => deletePost()} />}
        </div>
    );
};