import "../Comment.scss";

import { IComment } from "../../../../models/IComment";

import { useEffect, useRef, useState } from "react";
import { IUser } from "../../../../models/IUser";

import { PulseLoader } from "react-spinners";
import ReactMarkdown from "react-markdown";
import { formatRelativeTime } from "../../../../utils/relativeTimeFormatter";
import { Modal } from "../../../../components/modal/Modal";
import { useDeleteCommentMutation, useUpdateCommentMutation } from "../../../../redux/comments/commentsApi";



interface ICommentProps {
    comment: IComment,
    setFullPostCommentsCount: React.Dispatch<React.SetStateAction<number>>,
    setParentCommentsCount: React.Dispatch<React.SetStateAction<number>>,
    userData: IUser | null,
}

export const Reply = ({ comment, setFullPostCommentsCount, setParentCommentsCount, userData: userInfo }: ICommentProps) => {
    const user = comment.user as IUser;

    const moddedDate = formatRelativeTime(new Date(comment.createdAt));

    const [updateComment] = useUpdateCommentMutation();
    const [deleteComment] = useDeleteCommentMutation();

    const [showComment, setShowComment] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

    const [isLoadingEditing, setIsLoadingEditing] = useState(false);
    const [isEditingComment, setEditingcomment] = useState(false);
    const [currentCommentText, setCurrentCommentText] = useState(comment.text);
    const [commentErrorMsg, setCommentErrorMsg] = useState("");
    const [isCommentEdited, setIsCommentEdited] = useState(comment.isEdited);



    useEffect(() => {
        if (commentTextareaRef.current) {
            commentTextareaRef.current.style.height = 'inherit';
            commentTextareaRef.current.style.height = `${commentTextareaRef.current.scrollHeight}px`;
        }
    }, []);



    const resizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'inherit';
        e.target.style.height = `${e.target.scrollHeight}px`;

        const commentTextFromTextarea = e.target.value;

        if (commentTextFromTextarea.length > 1000) { return setCommentErrorMsg("Max. comment lenght is 1000 chars."); }
        if (commentTextFromTextarea.length <= 0) { return setCommentErrorMsg("Comment can't be empty"); }

        if (commentTextFromTextarea.length > 1000) { return setCommentErrorMsg("Max. comment lenght is 1000 chars."); }
        if (commentTextFromTextarea.length <= 0) { return setCommentErrorMsg("Comment can't be empty"); }

        setCommentErrorMsg("");
    };



    // Comments ----------------------------------------------------------------------
    const handleDeleteReply = async () => {
        const body =
        {
            _id: comment._id,
            postId: comment.postId,
            commentParentId: comment.commentParentId,
        };

        try {
            await deleteComment({ commentId: comment._id, body }).unwrap();
        }
        catch (error) { console.error("Could not delete the reply", error); }

        setFullPostCommentsCount(prev => prev - 1);
        setParentCommentsCount(prev => prev - 1);

        setShowComment(false);
    };



    const handleEditReply = async () => {
        if (!commentTextareaRef.current || !commentTextareaRef.current.value) return;

        const editedCommentText = commentTextareaRef.current.value;

        if (editedCommentText === currentCommentText) return;
        if (editedCommentText.length > 1000) return;

        setIsLoadingEditing(true);

        try { await updateComment({ commentId: comment._id, body: { postId: comment.postId, text: editedCommentText } }).unwrap(); }
        catch (error) { console.error("Could not edit the comment", error); }

        setCurrentCommentText(editedCommentText);
        setIsCommentEdited(true);
        setEditingcomment(false);

        setIsLoadingEditing(false);
    };
    //--------------------------------------------------------------------------------



    if (!showComment) { return <></>; }



    return (
        <div className="comment">

            {userInfo?._id === user._id &&
                <div className="comment__options">
                    <button onClick={() => setShowModal(true)}>X</button>
                    <button onClick={() => { setEditingcomment(!isEditingComment); }}>{isEditingComment ? "Cancel editing" : "edit"}</button>
                </div>
            }

            <div className="comment__user-wrapper">
                <img src={process.env.REACT_APP_BACKEND + user.userAvatar} alt="User's avatar" />
                <div className="comment__user">
                    <p>{user.name}</p>
                    <p>{moddedDate} {isCommentEdited && "(edited)"}</p>
                </div>
            </div>

            {isEditingComment
                ? <div className="comment__edit">
                    {commentErrorMsg && <p className="comment__error-msg">{commentErrorMsg}</p>}
                    <textarea ref={commentTextareaRef} defaultValue={currentCommentText} rows={1} onChange={(e) => resizeTextarea(e)} />

                    {!isLoadingEditing
                        ? <button onClick={handleEditReply}>confirm</button>
                        : <button><PulseLoader color={"#c52b2b"} size={7} /></button>
                    }
                </div>
                : <ReactMarkdown className="comment__text" children={currentCommentText} />
            }

            {showModal && <Modal text={"Delete the reply?"} setShowModal={setShowModal} performAction={() => handleDeleteReply()} />}
        </div >
    );
};