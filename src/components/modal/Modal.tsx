import "./Modal.scss";
import { useEffect, useRef } from "react";

interface ModalProps
{
    text: string,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    performAction: () => void,
}

export const Modal = ({ text, setShowModal, performAction: deletePost, }: ModalProps) =>
{
    const modalRef = useRef<HTMLDivElement>(null);



    useEffect(() =>
    {
        const closeModal = (e: MouseEvent) =>
        {
            const target = e.target as HTMLElement;

            if (target.tagName !== "BUTTON" && target.parentElement?.tagName !== "BUTTON" && !modalRef.current?.contains(target))
            { setShowModal(false); }
        };

        document.addEventListener("click", closeModal);
        return () => { document.removeEventListener("click", closeModal); };
    }, [setShowModal]);

    return (
        <div className="modal">
            <div className="modal__box" ref={modalRef}>
                <p>{text}</p>
                <div className="modal__button-wrapper">
                    <button onClick={() => { deletePost(); setShowModal(false); }}>Yes</button>
                    <button onClick={() => { setShowModal(false); }}>No</button>
                </div>
            </div>
        </div>
    );
};