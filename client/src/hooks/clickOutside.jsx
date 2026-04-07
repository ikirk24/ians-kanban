import React, {useEffect} from 'react'

export default function clickOutside (ref, callback) {
    useEffect(() => {
        function handleClick(event) {
            if (!ref.current) return;

            if (!ref.current.contains(event.target)) {
                callback();
            }
        }

        document.addEventListener("mousedown", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [ref, callback]);
  
}
