import { render, screen, fireEvent } from '@testing-library/react'
import DailyScaleBuilder from '../components/DailyScaleBuilder'

// Mock do Supabase para evitar chamadas reais ao banco durante os testes
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [
            { id: '1', nome_guerra: 'TESTE 01', posto_grad: 'SD', matricula: '123', antiguidade: 1, status: 'ATIVO' }
          ], error: null })),
        })),
        delete: jest.fn(() => ({
            eq: jest.fn(() => ({ 
                eq: jest.fn(() => Promise.resolve({ error: null })) 
            }))
        }))
      })),
    })),
  },
}))

describe('DailyScaleBuilder Logic', () => {
  it('deve renderizar o componente corretamente', async () => {
    render(<DailyScaleBuilder />)
    // Verifica se o título de "Disponíveis" aparece
    const title = await screen.findByText(/Disponíveis/i)
    expect(title).toBeInTheDocument()
  })

  // Nota: Testes de interação mais complexos (clicar na vaga, etc) 
  // exigem mocks mais detalhados de hooks do Next.js
})
