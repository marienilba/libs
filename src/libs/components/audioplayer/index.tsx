"use client";

import {
  useEventListener,
  useEventListenerValue,
} from "@/libs/hooks/useEventListener";
import {
  ComponentProps,
  ReactNode,
  RefObject,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { As, AsProps } from "../as";
import { useEffectValue } from "@/libs/hooks/useEffect";

export const Player = () => <></>;

const Context = createContext<{ ref: RefObject<HTMLAudioElement> }>({
  ref: null as any,
});

type PlayerRoot<T extends keyof JSX.IntrinsicElements> = {
  children: ReactNode;
} & AsProps<T>;

Player.Root = <T extends keyof JSX.IntrinsicElements>({
  ...props
}: PlayerRoot<T>) => {
  const ref = useRef<HTMLAudioElement>(null);

  return (
    <Context.Provider value={{ ref: ref }}>
      <As {...props} />
    </Context.Provider>
  );
};

type AudioProps = {} & ComponentProps<"audio">;
Player.Audio = ({ children, ...props }: AudioProps) => {
  const { ref } = useContext(Context);

  return (
    <audio ref={ref} {...props}>
      {children}
    </audio>
  );
};

type SourceProps = {} & ComponentProps<"source">;
Player.Source = ({ ...props }: SourceProps) => <source {...props}></source>;

type ButtonProps = {
  onClick: (
    ref: HTMLAudioElement,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
} & Omit<ComponentProps<"button">, "onClick">;
Player.Button = ({ children, onClick, ...props }: ButtonProps) => {
  const { ref } = useContext(Context);
  return (
    <button
      onClick={(e) => {
        if (!ref || !ref.current)
          throw new Error("No audio element in the context");
        onClick(ref.current, e);
      }}
      {...props}
    >
      {children}
    </button>
  );
};

type PlayProps = {} & Omit<ComponentProps<"button">, "onClick">;
Player.Play = ({ children, ...props }: PlayProps) => {
  const { ref } = useContext(Context);
  const [isPlaying, setIsPlaying] = useState(false);

  useEventListener(ref, "playing", () => {
    setIsPlaying(true);
  });

  useEventListener(ref, "pause", () => {
    setIsPlaying(false);
  });

  return (
    <Player.Button
      onClick={(audio) => {
        audio.play();
      }}
      data-play={isPlaying}
      data-pause={!isPlaying}
      {...props}
    >
      {children}
    </Player.Button>
  );
};

type PauseProps = {} & Omit<ComponentProps<"button">, "onClick">;
Player.Pause = ({ children, ...props }: PauseProps) => {
  const { ref } = useContext(Context);
  const [isPaused, setIsPaused] = useState(true);
  useEventListener(ref, "playing", () => {
    setIsPaused(false);
  });

  useEventListener(ref, "pause", () => {
    setIsPaused(true);
  });

  return (
    <Player.Button
      onClick={(audio) => {
        audio.pause();
      }}
      data-play={!isPaused}
      data-pause={isPaused}
      {...props}
    >
      {children}
    </Player.Button>
  );
};

type Volume = {
  volume: number;
};
type VolumeProps = {
  children: (volume: Volume) => ReactNode;
};
Player.Volume = ({ children }: VolumeProps) => {
  const { ref } = useContext(Context);

  const volume = useEffectValue(
    () => {
      if (ref.current) return ref.current.volume;
      return 0;
    },
    [ref],
    0
  );

  const volumeChanged = useEventListenerValue(
    ref,
    "volumechange",
    (event) => (event.target as HTMLAudioElement).volume,
    0
  );

  return children({ volume: volumeChanged ?? volume });
};

type Time = {
  time: number;
  duration: number;
};
type TimeProps = {
  children: (time: Time) => ReactNode;
};
Player.Time = ({ children }: TimeProps) => {
  const { ref } = useContext(Context);

  const time = useEventListenerValue(
    ref,
    "timeupdate",
    (event) => (event.target as HTMLAudioElement).currentTime,
    0
  );

  const duration = useEffectValue(
    () => {
      if (ref.current) return ref.current.duration;
      return 0;
    },
    [ref],
    0
  );

  const durationChanged = useEventListenerValue(
    ref,
    "durationchange",
    (event) => (event.target as HTMLAudioElement).duration,
    0
  );

  return children({ time, duration: durationChanged || duration });
};
