import { useEffect, useRef, useState } from "react";
import "./App.css";

import jsonIngredients from "./../src/assets/data/ingredients.json";
import jsonBeverages from "./../src/assets/data/beverages.json";
import jsonMembers from "./../src/assets/data/members.json";
import jsonAbelforth from "./../src/assets/data/abelforth.json";

function App() {
  const [toggle, setToggle] = useState(false);

  const barRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = barRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;

    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
  };

  const scroll = (direction: "left" | "right") => {
    const el = barRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction === "left" ? -150 : 150,
      behavior: "smooth",
    });
  };

  const [paintingsModal, setPaintingsModal] = useState<boolean>(false);
  const [infoModal, setInfoModal] = useState<boolean>(false);

  const [foundMember, setFoundMember] = useState<string>("");
  const [discoveredMembers, setDiscoveredMembers] = useState<string[]>([]);

  const [msgAbelforth, setMsgAbelforth] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setToggle((prev) => !prev);
    }, 500);

    setMsgAbelforth(abelforth.presentation);

    const discovered = localStorage.getItem("discovered");
    if (discovered) {
      setDiscoveredMembers(JSON.parse(discovered));
    }

    const el = barRef.current;
    if (!el) return;

    updateScrollButtons();

    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const isModalOpen = paintingsModal || infoModal || foundMember;

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [paintingsModal, infoModal, foundMember]);

  const ingredients = jsonIngredients;
  const beverages = jsonBeverages;
  const members = jsonMembers;
  const abelforth = jsonAbelforth;

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  function handleClickIngredient(id: string) {
    let updatedIngredients = [...selectedIngredients];

    if (selectedIngredients.includes(id))
      updatedIngredients = updatedIngredients.filter((item) => item !== id);
    else if (selectedIngredients.length < 3) updatedIngredients.push(id);

    setSelectedIngredients(updatedIngredients);
  }

  function handleReset() {
    setSelectedIngredients([]);
    setFoundMember("");
    setMsgAbelforth("");
  }

  function handleServe() {
    let sentence = "";
    if (selectedIngredients.length < 3) {
      sentence =
        abelforth["count"][
          Math.floor(Math.random() * abelforth["count"].length)
        ];
      setMsgAbelforth(sentence);
      return;
    }
    Object.entries(beverages).forEach(([id, recipe]) => {
      const recipeIngredients = [...recipe.composition].sort();
      const selected = [...selectedIngredients].sort();

      const isMatch = recipeIngredients.every((v, i) => v === selected[i]);

      const isClose =
        recipeIngredients.filter((item) => selected.includes(item)).length == 2;

        const member =
        Object.entries(members).find(
          ([_, value]) => value.beverage === id
        )?.[0] ?? "";

      if (isMatch) {
        setFoundMember(member);
        if (!discoveredMembers.includes(member)) {
          const newDiscoveredMembers = [...discoveredMembers];
          newDiscoveredMembers.push(member);
          setDiscoveredMembers(newDiscoveredMembers);
          localStorage.setItem(
            "discovered",
            JSON.stringify(newDiscoveredMembers)
          );
        }
        return;
      } else if (isClose) {
        sentence = abelforth["close"][
          Math.floor(Math.random() * abelforth["close"].length)
        ].replace("{{name}}", members[member].pseudo);
        setMsgAbelforth(sentence);
        return;
      }
    });

    if (sentence == "") {
      sentence =
        abelforth["off"][Math.floor(Math.random() * abelforth["off"].length)];
      setMsgAbelforth(sentence);
    }
  }

  return (
    <>
      {foundMember != "" && (
        <div className="w-full h-full flex flex-col gap-4 items-center justify-center member-found px-4 z-9999">
          <p className="bravo">Bravo !</p>

          <img width={150} height={300} src={members[foundMember].avatar} />

          <div className="flex flex-col gap-1">
            <p className="member-name">
              Tu as trouvé la boisson préférée de {members[foundMember].name} !
            </p>
            <div className="flex flex-col items-center">
              <p className="text-center text-secondary">
                {beverages[members[foundMember].beverage].name}
              </p>
              <p className="text-center text-secondary">
                {
                  ingredients[
                    beverages[members[foundMember].beverage].composition[0]
                  ].name
                }{" "}
                -{" "}
                {
                  ingredients[
                    beverages[members[foundMember].beverage].composition[1]
                  ].name
                }{" "}
                -{" "}
                {
                  ingredients[
                    beverages[members[foundMember].beverage].composition[2]
                  ].name
                }
              </p>
            </div>
          </div>

          <div className="flex flex-wrap flex-row justify-center items-start gap-4">
            <button
              className="nav-button"
              onClick={handleReset}
              aria-label="Retourner au bar"
            >
              Retourner au bar
            </button>
            <button
              className="nav-button"
              onClick={() => {
                setPaintingsModal(true);
                handleReset();
              }}
              aria-label="Voir les tableaux"
            >
              Voir les tableaux
            </button>
          </div>
        </div>
      )}

      {infoModal && (
        <div
          onClick={() => setInfoModal(false)}
          className="w-full h-full flex flex-col items-center justify-center modal-container z-9999"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col info-modal p-4 gap-4"
          >
            <div className="flex flex-row w-full justify-between">
              <h2 className="text-inverse">Informations</h2>
              <button
                aria-label="Fermer"
                onClick={() => setInfoModal(false)}
                className="p-1!"
              >
                <img
                  src={
                    toggle
                      ? "../src/assets/images/x-1.png"
                      : "../src/assets/images/x-2.png"
                  }
                  alt=""
                />
              </button>
            </div>
            <div className="flex-info gap-3 flex flex-col">
              <div className="flex flex-col gap-1">
                <h3 className="text-inverse">Comment jouer</h3>
                <p className="text-inverse">
                  Créez des boissons en mélangeant trois ingrédients différents
                  et servez les à Abelforth pour tenter de découvrir les
                  boissons préférés des membres de l'équipe des Trois Balais.{" "}
                  <br />
                  Si vous vous sentez perdu, pensez à écouter Abelforth, il fait
                  parfois des remarques intéressantes. N'hésitez également pas à
                  aller directement voir les membres de l'équipe pour tenter de
                  leur sous-tirer des informations.
                  <br />
                  Votre avancée est conservée même si vous quittez la page.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-inverse">Les dessous de la réalisation</h3>
                <p className="text-inverse">
                  Évolution de l'écran de jeu au cours du processus de
                  développement :
                </p>
                <div className="flex flex-row gap-2 flex-wrap items-center">
                  <div className="flex flex-col items-center gap-1">
                    <a href={"../src/assets/history/v0.png"} target="_blank">
                      <img width={330} src={"../src/assets/history/v0.png"} />
                    </a>
                    <span className="text-inverse small">Première version</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <a href={"../src/assets/history/v1.png"} target="_blank">
                      <img width={330} src={"../src/assets/history/v1.png"} />
                    </a>
                    <span className="text-inverse small">Deuxième version</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <a href={"../src/assets/history/v2.png"} target="_blank">
                      <img width={330} src={"../src/assets/history/v2.png"} />
                    </a>
                    <span className="text-inverse small">
                      Troisième version
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <a href={"../src/assets/history/v3.png"} target="_blank">
                      <img width={330} src={"../src/assets/history/v3.png"} />
                    </a>
                    <span className="text-inverse small">Version actuelle</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-inverse">Sources</h3>
                <p className="text-inverse">
                  Développement, icônes et illustrations : Feozard <br />
                  Police de caractère :{" "}
                  <a
                    className="text-inverse underline"
                    href="https://www.fontspace.com/ormolu-font-f140268"
                    target="_blank"
                  >
                    {" "}
                    Ormolu Font
                  </a>{" "}
                  <br />
                  Merci à l'équipe pour la conception de leur boisson préférée
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {paintingsModal && (
        <div
          onClick={() => setPaintingsModal(false)}
          className="w-full h-full flex flex-col items-center justify-center modal-container z-9999"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center portraits-modal p-4 gap-4"
          >
            <div className="flex flex-row w-full justify-between">
              <h2 className="text-inverse">Tableaux</h2>
              <button
                aria-label="Fermer"
                onClick={() => setPaintingsModal(false)}
                className="p-1!"
              >
                <img
                  src={
                    toggle
                      ? "../src/assets/images/x-1.png"
                      : "../src/assets/images/x-2.png"
                  }
                  alt=""
                />
              </button>
            </div>
            <div className="grid-portraits">
              {Object.entries(members).map(([id, member]) => (
                <div
                  key={id}
                  className="flex flex-col gap-1 items-center w-[200px] px-2"
                >
                  <img
                    width={150}
                    src={
                      discoveredMembers.includes(id)
                        ? member.avatar
                        : toggle
                        ? "../src/assets/images/avatar-1.png"
                        : "../src/assets/images/avatar-2.png"
                    }
                    alt={`Avatar de ${member.name}`}
                  />
                  <p className="text-inverse">{member.name}</p>
                  <p className="text-inverse-secondary small text-center">
                    {discoveredMembers.includes(id) ? (
                      <>
                        {beverages[member.beverage].name}
                        <br />(
                        {
                          ingredients[beverages[member.beverage].composition[0]]
                            .name
                        }
                        {" - "}
                        {
                          ingredients[beverages[member.beverage].composition[1]]
                            .name
                        }
                        {" - "}
                        {
                          ingredients[beverages[member.beverage].composition[2]]
                            .name
                        }
                        )
                      </>
                    ) : (
                      "Inconnue"
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        aria-hidden={paintingsModal || infoModal || foundMember != ""}
        className="max-w-[1440px] mx-auto px-2"
      >
        <div className="flex flex-col min-h-screen w-full py-2 items-center">
          <h1 className="mobile-header mb-1">Les Trois Balais</h1>
          <div className="w-full flex flex-row justify-between items-center h-fit">
            <div className="flex-1">
              <button
                className="nav-button"
                onClick={() => setInfoModal(true)}
                aria-label="Informations"
              >
                Informations
                <img
                  src={
                    toggle
                      ? "../src/assets/images/help-1.png"
                      : "../src/assets/images/help-2.png"
                  }
                  alt=""
                />
              </button>
            </div>
            <h1 className="desktop-header">Les Trois Balais</h1>
            <div className="flex-1 flex flex-row justify-end">
              <button
                className="nav-button"
                aria-label="Tableaux"
                onClick={() => setPaintingsModal(true)}
              >
                Tableaux
                <img
                  src={
                    toggle
                      ? "../src/assets/images/portraits-1.png"
                      : "../src/assets/images/portraits-2.png"
                  }
                  alt=""
                />
              </button>
            </div>
          </div>

          <div className="my-3 flex-1 w-full flex flex-col items-center justify-center glass-container">
            <div className="relative flex-1 flex flex-col items-left justify-between gap-4 p-3 w-full principal-content glass">
              <div className="flex gap-2 msg-abelforth">
                <img
                  width={100}
                  height={100}
                  src={"../src/assets/avatars/abelforth.png"}
                  alt="Avatar de Abelforth Dumbledore"
                />
                {msgAbelforth != "" && (
                  <div className="speech-bubble">{msgAbelforth}</div>
                )}
              </div>
              <div className="w-full flex flex-col items-center">
                <img
                  src={
                    selectedIngredients.length == 1
                      ? toggle
                        ? "../src/assets/images/level1-glass-1.png"
                        : "../src/assets/images/level1-glass-2.png"
                      : selectedIngredients.length == 2
                      ? toggle
                        ? "../src/assets/images/level2-glass-1.png"
                        : "../src/assets/images/level2-glass-2.png"
                      : selectedIngredients.length == 3
                      ? toggle
                        ? "../src/assets/images/level3-glass-1.png"
                        : "../src/assets/images/level3-glass-2.png"
                      : toggle
                      ? "../src/assets/images/empty-glass-1.png"
                      : "../src/assets/images/empty-glass-2.png"
                  }
                  alt="Verre vide"
                />
                <div className="flex flex-wrap flex-row justify-center items-start gap-4">
                  <button
                    className="game-button"
                    onClick={handleReset}
                    aria-label="Jeter"
                  >
                    Jeter
                    <img
                      src={
                        toggle
                          ? "../src/assets/images/trash-1.png"
                          : "../src/assets/images/trash-2.png"
                      }
                      alt=""
                    />
                  </button>
                  <button
                    onClick={handleServe}
                    className="game-button"
                    aria-label="Servir"
                  >
                    Servir
                    <img
                      src={
                        toggle
                          ? "../src/assets/images/go-1.png"
                          : "../src/assets/images/go-2.png"
                      }
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="h-fit bar-container w-full relative scroll-smooth overflow-x-auto">
            <div
              ref={barRef}
              className="bar flex flex-row gap-3 items-center p-3"
            >
              {Object.entries(ingredients).map(
                ([id, ingredient]) =>
                  ingredient.image1 != "" && (
                    <div
                      key={id}
                      onClick={() => handleClickIngredient(id)}
                      className="p-2 flex flex-col justify-center items-center ingredient gap-1 relative"
                    >
                      <img
                        width={96}
                        height={96}
                        src={toggle ? ingredient.image1 : ingredient.image2}
                      />
                      <p className="text-inverse small text-center h-[36px]">
                        {ingredient.name}
                      </p>
                      {selectedIngredients.includes(id) && (
                        <div className="absolute top-0 right-0 p-1 selected">
                          <img
                            src={
                              toggle
                                ? "../src/assets/images/ok-1.png"
                                : "../src/assets/images/ok-2.png"
                            }
                            alt=""
                          />
                        </div>
                      )}
                    </div>
                  )
              )}
            </div>
            {canScrollLeft && (
              <div
                role="button"
                aria-label="Vers la gauche"
                onClick={() => scroll("left")}
                className="scroll-left"
              >
                <img
                  src={
                    toggle
                      ? "../src/assets/images/left-1.png"
                      : "../src/assets/images/left-2.png"
                  }
                />
              </div>
            )}

            {canScrollRight && (
              <div
                role="button"
                aria-label="Vers la droite"
                onClick={() => scroll("right")}
                className="scroll-right"
              >
                <img
                  src={
                    toggle
                      ? "../src/assets/images/right-1.png"
                      : "../src/assets/images/right-2.png"
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
