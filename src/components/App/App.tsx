// =======================================================
// ===== refactoring "React Query" and pagination ========
// =======================================================

//=== Імпорт зовнішніх бібліотек (npm install) ====
import { useEffect, useState } from "react";
import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query"; // Додано useQueryClient
import { Toaster, toast } from "react-hot-toast";
//--- бібліотека react-paginate у Vite версії 8+(специфіка)
import ReactPaginateModule from "react-paginate";
import type { ReactPaginateProps } from "react-paginate";
import type { ComponentType } from "react";

type ModuleWithDefault<T> = { default: T };

const ReactPaginate = (
  ReactPaginateModule as unknown as ModuleWithDefault<
    ComponentType<ReactPaginateProps>
  >
).default;

//=== Імпорт модулів / Components =================
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Loader from "../Loader/Loader";
import MovieGrid from "../MovieGrid/MovieGrid";
import MovieModal from "../MovieModal/MovieModal";
import SearchBar from "../SearchBar/SearchBar";
//=== Імпорт модулів / SRC =========================
import { fetchMovies, type MoviesData } from "../../services/movieService";
import type { Movie } from "../../types/movie";

import css from "./App.module.css";

function App() {
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Доступ до клієнта React Query для миттєвого очищення кешу при порожньому запиті
  const queryClient = useQueryClient();

  const { data, isSuccess, isError, error, isFetching, dataUpdatedAt } =
    useQuery<MoviesData>({
      queryKey: ["movies", query, page],
      queryFn: () => fetchMovies(query, page),
      enabled: query.length > 0, // Ваша базова початкова умова запиту
      placeholderData: keepPreviousData, // Синтаксис пагінації v5
    });

  const movies: Movie[] = data?.results ?? [];
  const totalPages: number = data?.total_pages ?? 0;

  // --- ВИПРАВЛЕНО: ВАРІАНТ ПОМИЛКИ 1: Якщо користувач відправив порожній інпут (при старті чи повторно)
  const handleSearch = (newQuery: string): void => {
    if (newQuery.trim() === "") {
      toast.error("Please enter your search query.");
      setQuery(""); // Очищуємо стейт, щоб увімкнути заголовок h5
      queryClient.removeQueries({ queryKey: ["movies"] }); // Вичищаємо старі результати, щоб сховати сітку фільмів
      return;
    }
    setQuery(newQuery);
    setPage(1); // Завжди скидаємо сторінку на першу при новому пошуку
  };

  // --- ВИПРАВЛЕНО: ВАРІАНТ ПОМИЛКИ 2: Помилка, якщо фільмів не знайдено (Toaster)
  // dataUpdatedAt змушує ефект реагувати на КОЖНУ успішну відповідь від TMDB
  useEffect(() => {
    if (isSuccess && !isFetching && movies.length === 0 && query !== "") {
      toast.error("No movies found for your search query.");
    }
  }, [isSuccess, isFetching, movies.length, query, dataUpdatedAt]);

  // --- ВИПРАВЛЕНО: ВАРІАНТ ПОМИЛКИ 3: Виведення технічних помилок сервера (502 / CORS)
  // Оптимізовано умову: прибрано !isFetching, щоб фонове оновлення TanStack Query не блокувало тост
  useEffect(() => {
    if (isError && error) {
      const errorMessage =
        error instanceof Error ? error.message : "Network error";
      toast.error(`Server Error: ${errorMessage}`);
    }
  }, [isError, error]);

  const openModal = (movie: Movie): void => {
    setSelectedMovie(movie);
  };

  const closeModal = (): void => {
    setSelectedMovie(null);
  };

  return (
    <div className={css.app}>
      {/* Клієнтський Toaster залізно примонтований на самому верху розмітки App із захистом zIndex */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        containerStyle={{
          top: 24,
          zIndex: 99999,
        }}
      />
      {/* Передаємо статус завантаження isFetching для блокування кнопки форми від спаму */}
      <SearchBar onSubmit={handleSearch} isLoading={isFetching} />

      {isFetching && <Loader />}

      {/* Модульне виведення помилки за допомогою компонента ErrorMessage */}
      {isError && <ErrorMessage />}

      {/* СТАРТОВИЙ ЕКРАН ТА ПОРОЖНІЙ ПОВТОРНИЙ ПОШУК: */}
      {/* h5 відображається завжди, коли сітка порожня, лоадер завершив роботу і немає помилок */}
      {movies.length === 0 && !isFetching && !isError && (
        <h5 className={css.infoTitle}>
          Enter your query in the search field to get started
        </h5>
      )}

      {isSuccess && movies.length > 0 && !isError && (
        <div className={isFetching ? css.fetching : undefined}>
          <MovieGrid movies={movies} onSelect={openModal} />

          {/* Пагінація має рендеритися лише тоді, коли кількість сторінок із завантаженими фільмами більше ніж 1 */}
          {totalPages > 1 && (
            <ReactPaginate
              pageCount={totalPages}
              pageRangeDisplayed={5}
              marginPagesDisplayed={1}
              onPageChange={({ selected }) => setPage(selected + 1)}
              forcePage={page - 1}
              containerClassName={css.pagination}
              activeClassName={css.active}
              nextLabel="→"
              previousLabel="←"
            />
          )}
        </div>
      )}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={closeModal} />
      )}
    </div>
  );
}

export default App; // Експорт за замовчуванням (вимога ТЗ)

// =======================================================
// =========== before refactoring and pagination =========
// =======================================================
//=== Імпорт зовнішніх бібліотек (npm install) ====
// import { useState } from "react";
// import { Toaster, toast } from "react-hot-toast";
//=== Імпорт модулів / Components =================
// import ErrorMessage from "../ErrorMessage/ErrorMessage";
// import Loader from "../Loader/Loader";
// import MovieGrid from "../MovieGrid/MovieGrid";
// import MovieModal from "../MovieModal/MovieModal";
// import SearchBar from "../SearchBar/SearchBar";
//=== Імпорт модулів / SRC =========================
// import { fetchMovies } from "../../services/movieService";
// import type { Movie } from "../../types/movie";
// import css from "./App.module.css";

// function App() {
//   const [movies, setMovies] = useState<Movie[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

//   const handleSearch = async (query: string) => {
//     setIsLoading(true);
//     setError(null);
//     setMovies([]);
//     setSelectedMovie(null);

//     try {
//       const data = await fetchMovies(query);

//       if (data.results.length === 0) {
//         toast.error("No movies found for your request.");
//         setMovies([]);
//       } else {
//         setMovies(data.results);
//       }
//     } catch {
//       setError("Failed to fetch movies");
//       toast.error("Failed to fetch movies. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const matchSelectedMovie = (movie: Movie) => {
//     setSelectedMovie(movie);
//   };

//   const matchCloseModal = () => {
//     setSelectedMovie(null);
//   };

//   return (
//     <div className={css.app}>
//       <Toaster
//         position="top-center"
//         reverseOrder={false}
//         containerStyle={{
//           top: 12,
//         }}
//       />
//       <SearchBar onSubmit={handleSearch} />
//       <main className={css.main}>
//         {isLoading && <Loader />}
//         {error && !isLoading && <ErrorMessage />}
//         {!isLoading && !error && movies.length > 0 && (
//           <MovieGrid movies={movies} onSelect={matchSelectedMovie} />
//         )}
//         {!isLoading && !error && movies.length === 0 && (
//           <h5>Enter your query in the search field to get started</h5>
//         )}
//         {selectedMovie && (
//           <MovieModal movie={selectedMovie} onClose={matchCloseModal} />
//         )}
//       </main>
//     </div>
//   );
// }

// export default App;
