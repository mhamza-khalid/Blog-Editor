import { useRef, useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "./App.css";

export default function App() {
  const editorRef = useRef(null);
  const [imageURL, setImageURL] = useState("");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState(0);
  const [body, setBody] = useState("<p>Start Bloggin!</p>")
  const [update, setUpdate] = useState(false)
  const [postId, setPostId] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (editorRef.current) {
      const content = editorRef.current.getContent();

      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      async function checkSignedIn(token) {
        try {
          const response = await fetch("http://localhost:3000/login/check", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });

          if (response.status !== 200) {
            alert("Please sign in to post");
            return;
          }

          let result = await response.json();
          const payload = {
            content,
            imageURL,
            title,
            id: result.id,
            time: time,
          };



          console.log(payload)

          try {
            if (update != true) {
              const formResponse = await fetch("http://localhost:3000/posts", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
              });
              const message = await formResponse.json();
              alert(
                "Post saved in user account. Visit your profile to publish!"
              );
              console.log("Post submitted:", message);
            }

            if (update == true) {
              const formResponse = await fetch(`http://localhost:3000/posts/${postId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
              });
              const message = await formResponse.json();
              alert(
                "Post has been updated successfully!"
              );
              console.log("Post updated:", message);
            }


          } catch (error) {
            console.error("Error updating post:", error);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }

      checkSignedIn(token);
    }
  };

  useEffect(() => {



    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const postId = params.get("postId")
    const _update = params.get("update")

    if (_update == "true") {
      console.log('update', update)
      setUpdate(true)
      setPostId(parseInt(postId))
      //now get post of that post id
      async function getPost() {

        const response = await fetch("http://localhost:3000/login/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.status !== 200) {
          alert("Please sign in to update post");
          return;
        }
        try {
          let response = await fetch(`http://localhost:3000/posts/${postId}`)
          if (response.status == 200) {
            let data = await response.json()
            console.log(data)
            setImageURL(data.imageURL)
            setTitle(data.title)
            setTime(data.readTime)
            setBody(data.body)
          }
          else {
            throw new Error('Failed to get post')
          }
        } catch (err) {
          console.log(err)
        }
      }

      getPost()
    }
  }, [])

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form-container">
        <h2>{update ? 'Update Post' : 'New Post'}</h2>

        <label htmlFor="image-url">Image URL</label>
        <input
          id="image-url"
          type="url"
          value={imageURL}
          onChange={(e) => setImageURL(e.target.value)}
          placeholder="Enter image URL"
          required
        />

        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title"
          required
        />

        <label htmlFor="reading-time">Reading Time (min)</label>
        <input
          id="reading-time"
          type="number"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="Enter reading time"
          required
        />

        <Editor
          apiKey={import.meta.env.VITE_TINY_MCE_API_KEY}
          onInit={(evt, editor) => (editorRef.current = editor)}
          initialValue={body}
          init={{
            height: 600,
            menubar: true,  
            plugins: [
              "advlist",
              "autolink",
              "lists",
              "link",
              "image",
              "charmap",
              "preview",
              "anchor",
              "searchreplace",
              "visualblocks",
              "code",
              "fullscreen",
              "insertdatetime",
              "media",
              "table",
              "codesample", // Code snippets
              "emoticons", // Emojis
              "help",
              "wordcount",
              "typography", // Advanced typography
              "formatpainter", // Formatting brush
              "spellchecker" // Spell checking
            ],
            toolbar:
              "undo redo | blocks | " +
              "bold italic forecolor | fontsizeselect fontselect | alignleft aligncenter " +
              "alignright alignjustify | bullist numlist outdent indent | " +
              "codesample emoticons | removeformat | help",
            content_style:
              "body { font-family:Roboto,Arial,sans-serif; font-size:14px }",
          }}
        />

        <button type="submit" className="submit-button">
          {update ? 'Update Post' : 'Save Post to Profile'}
        </button>
      </form>
    </div>
  );
}
