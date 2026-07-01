import css from "./SearchBar.module.css";

interface SearchBarProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

function SearchBar({ onSubmit, isLoading }: SearchBarProps) {
  // Функція обробки даних після натискання кнопки пошуку або Enter
  const handleAction = (formData: FormData) => {
    const query = formData.get("query") as string;
    onSubmit(query ? query.trim() : "");
  };

  // Відображення (рендеринг) форми пошуку та кнопки на екрані
  return (
    <header className={css.header}>
      <div className={css.container}>
        <a
          className={css.link}
          href="https://themoviedb.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by TMDB
        </a>
        <form className={css.form} action={handleAction}>
          <input
            className={css.input}
            type="text"
            name="query"
            autoComplete="off"
            placeholder="Search movies..."
            autoFocus // Курсор автоматично стає в поле при відкритті сайту
          />
          {/* Блокування кнопки. Коли йде завантаження (isLoading), кнопка вимикається */}
          <button className={css.button} type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>
    </header>
  );
}

export default SearchBar;

// =======================================================
// ====== HW-04 - before refactoring and pagination ======
// =======================================================
// import { useRef } from "react";
// import toast from "react-hot-toast";
// import css from "./SearchBar.module.css";

// interface SearchBarProps {
//   onSubmit: (query: string) => void;
// }

// function SearchBar({ onSubmit }: SearchBarProps) {
//   const searchForm = useRef<HTMLFormElement>(null);

//   const handleAction = (formData: FormData) => {
//     const query = formData.get("query") as string;

//     if (!query || query.trim() === "") {
//       toast.error("Please enter your search query.");
//       return;
//     }

//     onSubmit(query.trim());
//   };

//   return (
//     <header className={css.header}>
//       <div className={css.container}>
//         <a
//           className={css.link}
//           href="https://www.themoviedb.org/"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Powered by TMDB
//         </a>
//         <form className={css.form} action={handleAction} ref={searchForm}>
//           <input
//             className={css.input}
//             type="text"
//             name="query"
//             autoComplete="off"
//             placeholder="Search movies..."
//             autoFocus
//           />
//           <button className={css.button} type="submit">
//             Search
//           </button>
//         </form>
//       </div>
//     </header>
//   );
// }

// export default SearchBar;
