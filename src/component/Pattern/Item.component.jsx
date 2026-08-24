import React from 'react'
import classNames from 'classnames'


const Item = ({ 
    index, 
    checked, 
    handleOptionChange
}) => {
    return (
        <label>
            <input
                type="radio"
                className={`radio${index % 6}`}
                name="patterns"
                value={index}
                checked={checked}
                onChange={handleOptionChange}
            />
            <span className={classNames(index >= 10 && "adjPos", "radiolabel")}>{index}</span>
        </label>
    )
}

export default Item