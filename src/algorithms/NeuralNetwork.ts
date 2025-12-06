export type ActivationFunction = 'relu' | 'tanh' | 'sigmoid' | 'linear';
export type RegularizationType = 'none' | 'l1' | 'l2';

export interface Point {
  x: number;
  y: number;
  label: number; // 0 or 1 (or -1/1)
}

export class Node {
  id: string;
  bias: number = 0.1; // Initialize with small bias
  weights: { [nodeId: string]: number } = {};
  output: number = 0;
  totalInput: number = 0;
  delta: number = 0; // Error gradient

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
    // Build network structure
    for (let i = 0; i < layerSizes.length; i++) {
      const layer: Node[] = [];
      for (let j = 0; j < layerSizes[i]; j++) {
        const node = new Node(`${i}_${j}`);
        layer.push(node);
        
        // Connect to previous layer
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
    // Input layer
    const inputLayer = this.layers[0];
    for (let i = 0; i < inputLayer.length; i++) {
      inputLayer[i].output = inputs[i];
    }

    // Hidden & Output layers
    for (let i = 1; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const prevLayer = this.layers[i - 1];
      
      for (let j = 0; j < layer.length; j++) {
        const node = layer[j];
        let sum = node.bias;
        
        for (let k = 0; k < prevLayer.length; k++) {
          const prevNode = prevLayer[k];
          // Find link weight (optimization: store links better?)
          // For now, linear search or map is fine for small playground nets
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
    
    // Output error (assuming Mean Squared Error for regression/classification playground)
    // Derivative of MSE: (output - target)
    // Multiplied by derivative of activation
    const outputDeriv = this.applyActivationDeriv(outputNode.totalInput);
    outputNode.delta = (outputNode.output - target) * outputDeriv;

    // Backpropagate
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

    // Update weights
    for (let i = 0; i < this.links.length; i++) {
      const link = this.links[i];
      const gradient = link.source.output * link.dest.delta;
      
      // Regularization
      let regTerm = 0;
      if (this.regularization === 'l1') {
          regTerm = this.regularizationRate * (link.weight > 0 ? 1 : -1);
      } else if (this.regularization === 'l2') {
          regTerm = this.regularizationRate * link.weight;
      }

      link.weight -= this.learningRate * (gradient + regTerm);
    }

    // Update biases
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

// Dataset Generators
export const generateData = (type: string, count: number, noise: number): Point[] => {
    const points: Point[] = [];
    const rand = () => (Math.random() - 0.5) * 2; // -1 to 1

    for (let i = 0; i < count; i++) {
        let x = rand() * 5; // Scale to -5 to 5
        let y = rand() * 5;
        let label = 0;

        if (type === 'circle') {
            // Circle: Inside radius 2.5 is class 1
            const dist = Math.sqrt(x*x + y*y);
            label = dist < 2.5 ? 1 : -1;
        } else if (type === 'xor') {
            // XOR: Quadrants
            label = (x > 0 && y > 0) || (x < 0 && y < 0) ? 1 : -1;
        } else if (type === 'gauss') {
            // Two clusters
            if (Math.random() > 0.5) {
                x = 2 + rand(); // Cluster 1
                y = 2 + rand();
                label = 1;
            } else {
                x = -2 + rand(); // Cluster 2
                y = -2 + rand();
                label = -1;
            }
        } else if (type === 'spiral') {
            // Spiral
            const n = i / count;
            const r = n * 5;
            const t = 1.75 * n * 2 * Math.PI;
            x = r * Math.sin(t) + rand() * 0.1; // Add noise here
            y = r * Math.cos(t) + rand() * 0.1;
            label = 1;
            // Second arm? This is a single arm generator logic simplified
            // Let's do proper 2-arm spiral
            const arm = Math.random() > 0.5 ? 1 : -1;
            const r2 = Math.random() * 5;
            const t2 = (r2 / 5) * 2 * Math.PI + (arm === 1 ? 0 : Math.PI);
            x = r2 * Math.cos(t2);
            y = r2 * Math.sin(t2);
            label = arm;
        }

        // Add noise
        x += (Math.random() - 0.5) * (noise / 10);
        y += (Math.random() - 0.5) * (noise / 10);

        points.push({ x, y, label });
    }
    return points;
};
