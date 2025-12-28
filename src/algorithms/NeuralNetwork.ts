export type ActivationFunction = 'relu' | 'tanh' | 'sigmoid' | 'linear';
export type RegularizationType = 'none' | 'l1' | 'l2';

export interface Point {
  x: number;
  y: number;
  label: number; // 0 or 1 (or -1/1)
}

export class Node {
  id: string;
  bias: number = 0.1; // Inicializovať s malým biasom
  weights: { [nodeId: string]: number } = {};
  output: number = 0;
  totalInput: number = 0;
  delta: number = 0; // Gradient chyby

  constructor(id: string) {
    this.id = id;
  }
}

export class Link {
  source: Node;
  dest: Node;
  weight: number = Math.random() - 0.5;
  
  constructor(source: Node, dest: Node) {
    this.source = source;
    this.dest = dest;
  }
}

export class NeuralNetwork {
  layers: Node[][] = [];
  links: Link[] = [];
  learningRate: number = 0.03;
  activation: ActivationFunction = 'tanh';
  regularization: RegularizationType = 'none';
  regularizationRate: number = 0;

  constructor(layerSizes: number[]) {
    // Vybudovať štruktúru siete
    for (let i = 0; i < layerSizes.length; i++) {
      const layer: Node[] = [];
      for (let j = 0; j < layerSizes[i]; j++) {
        const node = new Node(`${i}_${j}`);
        layer.push(node);
        
        // Pripojiť k predchádzajúcej vrstve
        if (i > 0) {
          const prevLayer = this.layers[i - 1];
          prevLayer.forEach(prevNode => {
            const link = new Link(prevNode, node);
            this.links.push(link);
            node.weights[prevNode.id] = link.weight;
          });
        }
      }
      this.layers.push(layer);
    }
  }

  forward(inputs: number[]): number {
    // Vstupná vrstva
    const inputLayer = this.layers[0];
    for (let i = 0; i < inputLayer.length; i++) {
      inputLayer[i].output = inputs[i];
    }

    // Skryté & Výstupné vrstvy
    for (let i = 1; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const prevLayer = this.layers[i - 1];
      
      for (let j = 0; j < layer.length; j++) {
        const node = layer[j];
        let sum = node.bias;
        
        for (let k = 0; k < prevLayer.length; k++) {
          const prevNode = prevLayer[k];
          // Nájsť váhu spojenia (optimalizácia: ukladať spojenia lepšie?)
          // Zatiaľ stačí lineárne vyhľadávanie alebo mapa pre malé siete ihriska
          const link = this.links.find(l => l.source === prevNode && l.dest === node);
          if (link) {
              sum += prevNode.output * link.weight;
          }
        }
        
        node.totalInput = sum;
        node.output = this.applyActivation(sum);
      }
    }

    return this.layers[this.layers.length - 1][0].output;
  }

  backward(target: number) {
    const outputLayer = this.layers[this.layers.length - 1];
    const outputNode = outputLayer[0];
    
    // Výstupná chyba (predpokladáme Mean Squared Error pre ihrisko regresie/klasifikácie)
    // Derivácia MSE: (výstup - cieľ)
    // Vynásobené deriváciou aktivácie
    const outputDeriv = this.applyActivationDeriv(outputNode.totalInput);
    outputNode.delta = (outputNode.output - target) * outputDeriv;

    // Spätná propagácia
    for (let i = this.layers.length - 2; i >= 0; i--) {
      const layer = this.layers[i];
      const nextLayer = this.layers[i + 1];
      
      for (let j = 0; j < layer.length; j++) {
        const node = layer[j];
        let errorSum = 0;
        
        for (let k = 0; k < nextLayer.length; k++) {
          const nextNode = nextLayer[k];
          const link = this.links.find(l => l.source === node && l.dest === nextNode);
          if (link) {
            errorSum += nextNode.delta * link.weight;
          }
        }
        
        node.delta = errorSum * this.applyActivationDeriv(node.totalInput);
      }
    }

    // Aktualizovať váhy
    for (let i = 0; i < this.links.length; i++) {
      const link = this.links[i];
      const gradient = link.source.output * link.dest.delta;
      
      // Regularizácia
      let regTerm = 0;
      if (this.regularization === 'l1') {
          regTerm = this.regularizationRate * (link.weight > 0 ? 1 : -1);
      } else if (this.regularization === 'l2') {
          regTerm = this.regularizationRate * link.weight;
      }

      link.weight -= this.learningRate * (gradient + regTerm);
    }

    // Aktualizovať biasy
    for (let i = 1; i < this.layers.length; i++) {
      const layer = this.layers[i];
      for (let j = 0; j < layer.length; j++) {
        const node = layer[j];
        node.bias -= this.learningRate * node.delta;
      }
    }
  }

  applyActivation(x: number): number {
    switch (this.activation) {
      case 'relu': return Math.max(0, x);
      case 'tanh': return Math.tanh(x);
      case 'sigmoid': return 1 / (1 + Math.exp(-x));
      case 'linear': return x;
      default: return Math.tanh(x);
    }
  }

  applyActivationDeriv(x: number): number {
    switch (this.activation) {
      case 'relu': return x > 0 ? 1 : 0;
      case 'tanh': {
        const t = Math.tanh(x);
        return 1 - t * t;
      }
      case 'sigmoid': {
        const s = 1 / (1 + Math.exp(-x));
        return s * (1 - s);
      }
      case 'linear': return 1;
      default: return 1 - Math.tanh(x) * Math.tanh(x);
    }
  }
}

// Generátory datasetov
export const generateData = (type: string, count: number, noise: number): Point[] => {
    const points: Point[] = [];
    const rand = () => (Math.random() - 0.5) * 2; // -1 až 1

    for (let i = 0; i < count; i++) {
        let x = rand() * 5; // Škálovať na -5 až 5
        let y = rand() * 5;
        let label = 0;

        if (type === 'circle') {
            // Kruh: Vnútri polomeru 2.5 je trieda 1
            const dist = Math.sqrt(x*x + y*y);
            label = dist < 2.5 ? 1 : -1;
        } else if (type === 'xor') {
            // XOR: Kvadranty
            label = (x > 0 && y > 0) || (x < 0 && y < 0) ? 1 : -1;
        } else if (type === 'gauss') {
            // Dva zhluky
            if (Math.random() > 0.5) {
                x = 2 + rand(); // Zhluk 1
                y = 2 + rand();
                label = 1;
            } else {
                x = -2 + rand(); // Zhluk 2
                y = -2 + rand();
                label = -1;
            }
        } else if (type === 'spiral') {
            // Špirála
            const n = i / count;
            const r = n * 5;
            const t = 1.75 * n * 2 * Math.PI;
            x = r * Math.sin(t) + rand() * 0.1; // Pridať šum tu
            y = r * Math.cos(t) + rand() * 0.1;
            label = 1;
            // Druhé rameno? Toto je zjednodušená logika generátora s jedným ramenom
            // Spravme poriadnu 2-ramennú špirálu
            const arm = Math.random() > 0.5 ? 1 : -1;
            const r2 = Math.random() * 5;
            const t2 = (r2 / 5) * 2 * Math.PI + (arm === 1 ? 0 : Math.PI);
            x = r2 * Math.cos(t2);
            y = r2 * Math.sin(t2);
            label = arm;
        }

        // Pridať šum
        x += (Math.random() - 0.5) * (noise / 10);
        y += (Math.random() - 0.5) * (noise / 10);

        points.push({ x, y, label });
    }
    return points;
};
