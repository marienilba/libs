import { Accordion } from "@/libs/components/accordion";

export default function Home() {
  return (
    <Accordion.Group defaultIndex={1}>
      <Accordion.Item className="group">
        <Accordion.Title className="group-open:bg-pink-200">
          Epcot Center
        </Accordion.Title>
        <Accordion.Body className="group-open:bg-pink-200">
          Epcot is a theme park at Walt Disney World Resort featuring exciting
          attractions, international pavilions, award-winning fireworks and
          seasonal special events.
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item>
        <Accordion.Title>Epcot Center</Accordion.Title>
        <Accordion.Body>
          Epcot is a theme park at Walt Disney World Resort featuring exciting
          attractions, international pavilions, award-winning fireworks and
          seasonal special events.
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item>
        <Accordion.Title>Epcot Center</Accordion.Title>
        <Accordion.Body>
          Epcot is a theme park at Walt Disney World Resort featuring exciting
          attractions, international pavilions, award-winning fireworks and
          seasonal special events.
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item>
        <Accordion.Title>Epcot Center</Accordion.Title>
        <Accordion.Body>
          Epcot is a theme park at Walt Disney World Resort featuring exciting
          attractions, international pavilions, award-winning fireworks and
          seasonal special events.
        </Accordion.Body>
      </Accordion.Item>
    </Accordion.Group>
  );
}
