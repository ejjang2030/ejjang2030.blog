import {useContext, useEffect, useState} from "react";
import {collection, addDoc, doc, updateDoc, getDoc} from "firebase/firestore";
import {db} from "firebaseApp";
import AuthContext from "context/AuthContext";
import {useNavigate, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {CATEGORIES, CategoryType, PostProps} from "./PostList";

export default function PostForm() {
  const [title, setTitle] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [category, setCategory] = useState<CategoryType>("Frontend");
  const {user} = useContext(AuthContext);
  const params = useParams();
  const [post, setPost] = useState<PostProps | null>(null);
  const navigate = useNavigate();

  const getPost = async (id: string) => {
    if (id) {
      const docRef = doc(db, "posts", id);
      const docSnap = await getDoc(docRef);
      setPost({id: docSnap.id, ...(docSnap.data() as PostProps)});
    }
  };

  useEffect(() => {
    if (params?.id) {
      getPost(params.id);
    }
  }, []);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSummary(post.summary);
      setContent(post.content);
      setCategory(post.category as CategoryType);
    }
  }, [post]);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const {
      target: {name, value},
    } = e;

    if (name === "title") {
      setTitle(value);
    }
    if (name === "summary") {
      setSummary(value);
    }
    if (name === "content") {
      setContent(value);
    }
    if (name === "category") {
      setCategory(value as CategoryType);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (post && post.id) {
        // firestore로 데이터 수정
        const postRef = doc(db, "posts", post.id);
        await updateDoc(postRef, {
          title: title,
          content: content,
          summary: summary,
          updatedAt: new Date().toLocaleDateString("ko", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          category: category,
        });
        navigate(`/posts/${post.id}`);
        toast.success("게시글을 수정했습니다.");
      } else {
        await addDoc(collection(db, "posts"), {
          title: title,
          summary: summary,
          content: content,
          createdAt: new Date()?.toLocaleDateString("ko", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          email: user?.email,
          uid: user?.uid,
          category: category,
        });
        navigate("/");
        toast.success("게시글을 생성했습니다.");
      }
    } catch (error: any) {
      toast?.error(error?.code);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className='form'>
      <div className='form__block'>
        <label htmlFor='title'>제목</label>
        <input
          type='text'
          name='title'
          id='title'
          onChange={onChange}
          value={title}
          required
        />
      </div>
      <div className='form__block'>
        <label htmlFor='category'>카테고리</label>
        <select
          name='category'
          id='category'
          onChange={onChange}
          defaultValue={category}>
          <option value=''>카테고리를 선택해주세요.</option>
          {CATEGORIES?.map(category => (
            <option
              value={category}
              key={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className='form__block'>
        <label htmlFor='summary'>요약</label>
        <input
          type='text'
          name='summary'
          id='summary'
          onChange={onChange}
          value={summary}
          required
        />
      </div>
      <div className='form__block'>
        <label htmlFor='content'>내용</label>
        <textarea
          name='content'
          id='content'
          onChange={onChange}
          value={content}
          required
        />
      </div>
      <div className='form__block'>
        <input
          type='submit'
          value={post ? "수정" : "제출"}
          className='form__btn--submit'
        />
      </div>
    </form>
  );
}
