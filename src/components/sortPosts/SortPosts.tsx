import "./SortPosts.scss";

import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setSortBy } from "../../redux/posts/postsSlice";
import { RootState } from "../../redux/store";

export const SortPosts = () => {
    const dispatch = useAppDispatch();

    const sortDropdownRef = useRef<HTMLDivElement>(null);

    const [showSortDropdown, setShowSortDropdown] = useState(false);
    
    const sortByState = useAppSelector((state: RootState) => state.posts.sortBy);
    const [sortText, setSortText] = useState(sortByState);

    const sortPosts = async (option: string) => { setSortText(option); dispatch(setSortBy(option)); };



    useEffect(() => {
        const closeDropdown = (e: MouseEvent) => {
            if (!(e.target instanceof Node)) return;
            !sortDropdownRef.current?.contains(e.target) && setShowSortDropdown(false);
        };
        document.addEventListener("click", closeDropdown);
        return () => { document.removeEventListener("click", closeDropdown); };
    }, []);



    return (
        <div className="sort-dropdown" ref={sortDropdownRef}>
            <button onClick={() => setShowSortDropdown(!showSortDropdown)}>Sort by: {sortText}</button>

            <div className={!showSortDropdown ? "sort-dropdown__menu" : "sort-dropdown__menu sort-dropdown__menu--active"}>
                <button onClick={() => { sortPosts("new posts"); setShowSortDropdown(false); }}>New posts</button>
                <button onClick={() => { sortPosts("old posts"); setShowSortDropdown(false); }}>Old posts</button>
                <button onClick={() => { sortPosts("ascending hearts"); setShowSortDropdown(false); }}>Ascending hearts</button>
                <button onClick={() => { sortPosts("descending hearts"); setShowSortDropdown(false); }}>Descending hearts</button>
                <button onClick={() => { sortPosts("ascending views"); setShowSortDropdown(false); }}>Ascending views</button>
                <button onClick={() => { sortPosts("descending views"); setShowSortDropdown(false); }}>Descending views</button>
            </div>
        </div>
    );
};