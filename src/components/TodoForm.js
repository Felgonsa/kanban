import React from "react"


function TodoForm(props) {
    const [text, setText] = React.useState("")
    function handleChange(e) {
        let t = e.target.value
        setText(t)
    }

    function addItem(e) {
        e.preventDefault()
        if (text) {
            props.onAddItem(text)
            setText("")
        }

    }

    return (
        <form className="form" onSubmit={addItem}>
            <textarea onChange={handleChange} value={text} rows={1}
                className="input"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault()
                        addItem(e);
                    }
                }}
            />
            <button type="submit" className="btn" >+</button>
        </form>
    )

}

export default TodoForm